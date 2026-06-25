import { Request, Response } from "express";
import { redisClient } from '../index';
import { socket } from "../index";
import matchPlayers from "../services/MatchMaking/lookForMatch";
import { db } from "../database/db";
import { match, playerStatsHistory, users } from "../database/schema";
import { eq, sql, or, desc,and } from "drizzle-orm";

const matchController = {
    queueForMatch: async (req: Request, res: Response) => {
        try {
            const { username, userID, rating, mode } = await req.body;


            if (!username || !userID || !rating || !mode) {
                return res.status(400).json({ message: "All Fields are required" });
            }

            const timestamp = Date.now();
            if (mode == 'rated') {
                const player = {
                    username: username,
                    userID: userID,
                    rating: rating,
                    mode: mode,
                }
                if (rating <= 100) {
                    await redisClient.zadd('Q1', timestamp, JSON.stringify(player));

                    if ((await redisClient.zrange('Q1', 0, -1)).length >= 2) {
                        await matchPlayers('Q1');
                    }
                }
                else if (rating > 100 && rating <= 200) {
                    await redisClient.zadd('Q2', timestamp, JSON.stringify(player));
                    if ((await redisClient.zrange('Q2', 0, -1)).length >= 2) {
                        await matchPlayers('Q2');
                    }
                }
                else if (rating > 200 && rating <= 300) {
                    await redisClient.zadd('Q3', timestamp, JSON.stringify(player));
                    if ((await redisClient.zrange('Q3', 0, -1)).length >= 2) {
                        await matchPlayers('Q3');
                    }
                }
            }
            else {
                const player = {
                    username: username,
                    userID: userID,
                    rating: rating,
                    mode: mode,
                }
                await redisClient.zadd('unratedQueue', timestamp, JSON.stringify(player));
                if ((await redisClient.zrange('unratedQueue', 0, -1)).length >= 2) {
                    await matchPlayers('unratedQueue');
                }
            }



            const totalPlayersInQueue = (await redisClient.zrange('Q3', 0, -1)).length + (await redisClient.zrange('Q2', 0, -1)).length + (await redisClient.zrange('Q1', 0, -1)).length + (await redisClient.zrange('unratedQueue', 0, -1)).length;
            socket.emit('playersInQueue', { players: totalPlayersInQueue });
            return res.status(200).json({ message: "Joined Queue", timestamp: timestamp });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    dequeuePlayer: async (req: Request, res: Response) => {
        // will remove the player from redis queue (cancel looking for match)

        const { userID, rating, timestamp, mode } = await req.body;

        // console.log(await req.body);
        const numericRating = Number(rating); // Ensure rating is a number
        let QueueKey;
        try {
            // console.log(1);

            if (mode == 'unrated') {
                QueueKey = 'unratedQueue';
            }
            else {

                if (numericRating >= 50 && numericRating < 300) {

                    QueueKey = `Q${1}`;

                } else if (numericRating >= 300 && numericRating < 600) {

                    QueueKey = `Q${2}`;

                } else if (numericRating === 0) {

                    QueueKey = `Q${0}`;

                }
                else {
                    return res.status(400).json({ msg: "Invalid rating value" });
                }
            }

            const queue = await redisClient.zrange(QueueKey, 0, -1);
            const playerIndex = queue.findIndex((player) => {
                if (player) {
                    const parsedPlayer = JSON.parse(player);
                    return parsedPlayer.userID === userID;
                }
                return false;
            });
            if (playerIndex === -1) {
                return res.status(404).json({ msg: "Player not found in queue" });
            }

            const removePlayer = queue[playerIndex];
            await redisClient.zrem(QueueKey, removePlayer);
        } catch (error) {
            console.log("Error:", error);
            return res.status(500).json({ error: error });
        }
        socket.emit('playersInQueue', { players: (await redisClient.zrange(QueueKey, 0, -1)).length });
        // event.emit("player_left", { id, QueueKey });
        return res.status(200).json({ userID: userID, message: "Player removed from queue successfully" });
    },
    matchAbort: async (req: Request, res: Response) => {

        try {
            const { userID, roomID, rating } = req.body;

            // find the match 
            const getMatch = await db.select().from(match).where(eq(match.roomID, roomID)).limit(1);
            if (getMatch.length === 0) {
                return res.status(404).json({ message: "Match not found" });
            }

            //@ts-ignore
            const winner = getMatch[0].player1.userID === userID ? getMatch[0].player2.userID : getMatch[0].player1.userID;
            // update match as forfeited
            await db.update(match).set({
                winner: winner,
                loser: userID,
                solution: 'Abort'
            });

            // update the player stats / elo rating 
            await db.update(users).set({
                rating: rating - 2,
            }).where(eq(users.id, userID));
            await db.update(users).set({
                rating: rating + 5,
            }).where(eq(users.id, winner));


            // notify the winner via socket
            socket.emit(`toWinner_${winner}:${roomID}`, {
                message: "Your opponent has forfeited the match",
                roomID: roomID,
            });

            return res.status(200).json({ message: "Match forfeited successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // will handle the forfeit logic here
    },
    matchWin: async (req: Request, res: Response) => {
        try {
            const { userID, roomID, problemID, player1, player2, solution, rating, language } = req.body;
            // console.log("matchWin req body:", req.body);

            // Find the match
            const getMatch = await db.select().from(match).where(eq(match.roomID, roomID)).limit(1);
            // console.log("Match found:", getMatch);

            if (getMatch.length === 0) {
                return res.status(404).json({ message: "Match not found" });
            }

            // Check if match is already completed (to prevent double updates)
            if (getMatch[0].winner) {
                return res.status(400).json({ message: "Match already completed" });
            }

            // Determine loser
            const winner = userID;
            // @ts-ignore
            const loser = getMatch[0].player1.userID === userID ? getMatch[0].player2.userID : getMatch[0].player1.userID;

            // Update match with winner's data
            const data = await db.update(match).set({
                winner: winner,
                loser: loser,
                player1: { ...getMatch[0].player1!, language }, // Use existing if not provided
                player2: { ...getMatch[0].player2!, language }, // Use existing if not provided
                solution: solution,
                status: 'completed',
                // completedAt: new Date()
            }).where(eq(match.roomID, roomID))
                .returning();



            // Update winner rating
            await db.update(users).set({
                rating: rating + 10
            }).where(eq(users.id, userID));

            // update player match statistics
            const currentPlayer = await db.select().from(playerStatsHistory).where(eq(playerStatsHistory.userID, userID)).limit(1);
            await db.update(playerStatsHistory).set({
                total_wins: currentPlayer[0].total_wins + 1,
                total_matches: currentPlayer[0].total_matches + 1,
                rating: rating + 10
            })
                .where(eq(playerStatsHistory.userID, userID));

            console.log(loser);
            // Notify loser via socket
            socket.emit(`toLoser_${loser}:${roomID}`, {
                message: "You lost the match",
                matchData: data[0]
            });

            return res.status(200).json({
                message: "Match result recorded successfully",
                matchData: data[0]
            });

        } catch (error) {
            console.log("Error in matchWin:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    matchLose: async (req: Request, res: Response) => {
        try {
            const { userID, roomID, rating } = req.body;
            console.log("matchLose req body:", req.body);

            // Find the match
            const getMatch = await db.select().from(match).where(eq(match.roomID, roomID)).limit(1);
            console.log("Match found:", getMatch);

            if (getMatch.length === 0) {
                return res.status(404).json({ message: "Match not found" });
            }

            // Update the loser's rating
            await db.update(users).set({
                rating: rating - 5
            }).where(eq(users.id, userID));

            // update player match statistics
            const currentPlayer = await db.select().from(playerStatsHistory).where(eq(playerStatsHistory.userID, userID)).limit(1);
            await db.update(playerStatsHistory).set({
                total_losses: currentPlayer[0].total_losses + 1,
                total_matches: currentPlayer[0].total_matches + 1,
                rating: rating - 5
            })
                .where(eq(playerStatsHistory.userID, userID));

            return res.status(200).json({
                message: "Match loss recorded successfully",
                matchData: getMatch[0]
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    timeExpire: async (req: Request, res: Response) => {
        try {
            const { userID, roomID, passedCases, language } = req.body;

            // Store time expiry data
            await redisClient.rpush(`timeExpiry_${roomID}`, JSON.stringify({ userID, passedCases, language }));

            const length = await redisClient.llen(`timeExpiry_${roomID}`);
            console.log("Length of time expiry list:", length);

            if (length === 2) {
                // Both players' time expired
                const expiries = await redisClient.lrange(`timeExpiry_${roomID}`, 0, -1);
                const player1Data = JSON.parse(expiries[0]);
                const player2Data = JSON.parse(expiries[1]);

                console.log("Player1 Data:", player1Data);
                console.log("Player2 Data:", player2Data);

                // Determine result based on passed cases
                let updateData: any = {
                    status: 'expired',
                    solution: 'Time Expired',
                    endedAt: new Date()
                };

                let resultTypeForPlayer1: 'win' | 'loss' | 'draw' = 'draw';
                let resultTypeForPlayer2: 'win' | 'loss' | 'draw' = 'draw';

                if (player1Data.passedCases > player2Data.passedCases) {
                    // Player 1 wins
                    updateData.winner = player1Data.userID;
                    updateData.loser = player2Data.userID;
                    resultTypeForPlayer1 = 'win';
                    resultTypeForPlayer2 = 'loss';
                } else if (player2Data.passedCases > player1Data.passedCases) {
                    // Player 2 wins
                    updateData.winner = player2Data.userID;
                    updateData.loser = player1Data.userID;
                    resultTypeForPlayer1 = 'loss';
                    resultTypeForPlayer2 = 'win';
                } else {
                    // Draw - same number of passed cases
                    updateData.status = 'draw';
                    updateData.solution = 'Draw - Time Expired';
                }

                // Update match record
                const matchData = await db.update(match)
                    .set(updateData)
                    .where(eq(match.roomID, roomID))
                    .returning();

                // Send appropriate notifications
                if (updateData.status === 'draw') {
                    // Both players get draw notification
                    socket.emit(`matchTimeExpired:${roomID}:${player1Data.userID}`, {
                        message: "Match ended in a draw - time expired",
                        resultType: 'draw',
                        matchData: matchData[0]
                    });
                    socket.emit(`matchTimeExpired:${roomID}:${player2Data.userID}`, {
                        message: "Match ended in a draw - time expired",
                        resultType: 'draw',
                        matchData: matchData[0]
                    });
                } else {
                    // Winner gets win notification, loser gets loss notification
                    socket.emit(`matchTimeExpired:${roomID}:${player1Data.userID}`, {
                        message: `Match ended due to time expiry - ${resultTypeForPlayer1 === 'win' ? 'You won!' : 'You lost!'}`,
                        resultType: resultTypeForPlayer1,
                        matchData: matchData[0]
                    });
                    socket.emit(`matchTimeExpired:${roomID}:${player2Data.userID}`, {
                        message: `Match ended due to time expiry - ${resultTypeForPlayer2 === 'win' ? 'You won!' : 'You lost!'}`,
                        resultType: resultTypeForPlayer2,
                        matchData: matchData[0]
                    });
                }

                // Clean up Redis data
                await redisClient.del(`timeExpiry_${roomID}`);
            }

            return res.status(200).json({ message: "Time expiry noted" });
        } catch (error) {
            console.log("Error in timeExpire:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    getRankings: async (req: Request, res: Response) => {
        try {
            const { userID, page = 1, limit = 10 } = req.body;

            if (!userID) {
                return res.status(400).json({ message: "User ID is required" });
            }

            // Get all players sorted by rating (descending)
            const allPlayers = await db.select().from(playerStatsHistory).orderBy(desc(playerStatsHistory.rating));

            // Format player data
            const formattedPlayers = allPlayers.map((player:any) => ({
                userID: player.userID,
                username: player.username,
                wins: player.total_wins,
                losses: player.total_losses,
                draws: player.draws || 0,
                total: player.total_matches,
                rating: Math.round(player.rating),
                winRate: player.total_matches > 0
                    ? (player.total_wins / player.total_matches) * 100
                    : 0
            }));

            // Calculate pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedPlayers = formattedPlayers.slice(startIndex, endIndex);

            // Get user's specific rank
            const userIndex = formattedPlayers.findIndex((p:any) => p.userID === userID);
            const userRank = userIndex !== -1 ? userIndex + 1 : null;

            return res.status(200).json({
                message: "Rankings fetched successfully",
                rankings: paginatedPlayers,
                total: formattedPlayers.length,
                page: page,
                limit: limit,
                userRank: userRank,
                userStats: userIndex !== -1 ? formattedPlayers[userIndex] : null
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    getStats: async (req: Request, res: Response) => {
        try {

            const { userID } = req.body;

            console.log(userID);
            if (!userID) {
                return res.status(400).json({ message: "User ID is required" });
            }
            const stats = await db.select().from(playerStatsHistory).where(eq(playerStatsHistory.userID, userID));

            const updated = {
                wins: stats[0].total_wins,
                losses: stats[0].total_losses,
                total: stats[0].total_matches,
                rating: stats[0].rating,
                winRate: (stats[0].total_wins / stats[0].total_matches) * 100,
                draws: stats[0].draws || 0,
            }



            return res.status(200).json({ message: "Stats fetched successfully", stats: updated });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    matchHistory: async (req: Request, res: Response) => {
        try {

            const { userID } = req.body;
            if (!userID) {
                return res.status(400).json({ message: "User ID is required" });
            }
            const history = await db
                .select()
                .from(match)
                .where(
                    or(
                        eq(match.winner, userID),      // wins
                        eq(match.loser, userID),       // losses
                        and(
                            eq(match.status, "draw"),    // draws
                            or(
                                eq(sql`${match.player1}->>'userID'`, userID),
                                eq(sql`${match.player2}->>'userID'`, userID)
                            )
                        )
                    )
                )
                .orderBy(desc(match.id)); // or createdAt

            console.log("history", history);

            return res.status(200).json({ message: "Match history fetched successfully", history: history });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}

export default matchController;