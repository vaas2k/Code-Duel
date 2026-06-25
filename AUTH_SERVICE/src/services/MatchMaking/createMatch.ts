import { v4 as uuidv4 } from 'uuid';
import { redisClient } from "../../index";
// import { socket } from "../../index";
import { db } from '../../database/db';
import { match } from '../../database/schema';
import getTotalTestCases from '../CodeChecking/getLenforTestCases';

interface Player {
    username: string;
    userID: string;
    rating: number;
}

export default async function createMatch(player1: Player, player2: Player, mode: string) {
    try {

        const roomID = uuidv4();


        // generate a random problem ID from the problem set from 1 to 73
        const problemID = Math.floor(Math.random() * 73) + 1;


        // restrict the problem for both players for some time so they dont get the same problem again
        await redisClient.sadd(`problem:${problemID}:players`, player1.userID, player2.userID);
        await redisClient.expire(`problem:${problemID}:players`, 2400); // expire after 40 minutes



        // here we will chose the problem
        // the test cases
        // cases number
        const totalCases = getTotalTestCases(1);

        const matchData = {
            roomID: roomID,
            problemID: 1,
            player1: {
                username: player1.username,
                userID: player1.userID,
                rating: player1.rating,
                casesPassed: 0,
                win: false,
                lose: false,
                language: ''
            },
            player2: {
                username: player2.username,
                userID: player2.userID,
                rating: player2.rating,
                casesPassed: 0,
                win: false,
                lose: false,
                language: ''
            },
            totalCases: totalCases,
            solution: null
        };

        // expire match data after 1 hour
        await redisClient.hset(`match:${roomID}`, matchData);
        await redisClient.expire(`match:${roomID}`, 3600);
        await db.insert(match).values({
            roomID: roomID,
            problemID: problemID,
            player1: matchData.player1,
            player2: matchData.player2,
            totalCases: matchData.totalCases,
            solution: matchData.solution,
            rated: mode === 'unrated' ? false : true,
        })

        return matchData;

    } catch (error) {

        console.log(error);
        return error
    }
}