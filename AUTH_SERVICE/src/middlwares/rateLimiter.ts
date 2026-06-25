import { NextFunction, Request, Response } from "express";
import { redisClient } from "..";

export async function rateLimiter (req: Request, res : Response, next : NextFunction){
    try {

        const {userID} = req.body;

        if(!userID){
            return res.status(400).json({message : "All Fields are required"});
        }

        // get the req url
        const url = req.originalUrl;

        // 5 requests per minute allowed
        let MAX_REQUESTS = 0;
        let MAX_TTL = 0;

        switch (url) {
            case '/get-rankings':
                MAX_REQUESTS = 5;
                MAX_TTL = 60;
                break;
            case '/add-feedback':
                MAX_REQUESTS = 1;
                MAX_TTL = 60 * 60 * 3; // 3 hours
                break;   
        }

        const key = `ratelimiter:${userID}`;
        // set user in redis with a count value in given time 
        // if that count under given time is exceeded then ask user to wait
        // if count is not exceeded then pass the request to next middleware
        // reset the count after given time

        let count : any = await redisClient.get(key);

        // console.log("USERID", userID, " _ ", "COUNT", count);
        if(count) {
            let currentCount = parseInt(count);
            if(currentCount >= MAX_REQUESTS) {
                const ttl = await redisClient.ttl(key);
                if(url == '/add-feedback') {
                   const hrs = (ttl / 60 / 60).toFixed(2); 
                   return res.status(429).json({message : `Too Many Requests , Please wait for ${hrs} hrs`});
                }

                return res.status(429).json({message : `Too Many Requests , Please wait for ${ttl} seconds`});
            }
            await redisClient.incr(key);
        }
        else{
            await redisClient.set(key, 1);
            await redisClient.expire(key, MAX_TTL);
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal Server Error"});
    }
}