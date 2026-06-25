import { redisClient } from "../../index";
import { socket } from "../../index";
import createMatch from "./createMatch";
export default async function matchPlayers(queueKey: string) {
    try {

        const players = await redisClient.zrange(queueKey, 0, 1);
        if (players.length < 2) {
            return;
        }

        const player1 = JSON.parse(players[0]);
        const player2 = JSON.parse(players[1]);


        const matchDetails = await createMatch(player1, player2,queueKey);

        console.log(`Match found between`, matchDetails);

        // Emit an event to notify that a match has been found
        setTimeout(async () => {
            
            socket.emit(`matchFound:${player1.userID}`, { matchDetails });
            socket.emit(`matchFound:${player2.userID}`, { matchDetails });
            // Remove the matched players from the queue
            await redisClient.zrem(queueKey, JSON.stringify(player1));
            await redisClient.zrem(queueKey, JSON.stringify(player2));         
            socket.emit('playersInQueue', { players: (await redisClient.zrange(queueKey, 0, -1)).length });
            
        },3000);


    }catch(error) {
        console.log(error);   
    }
}