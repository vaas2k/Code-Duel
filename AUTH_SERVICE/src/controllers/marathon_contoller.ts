import e, { Request, Response } from "express";
import { db } from "../database/db";
import { marathon_match, problems } from "../database/schema";
import { eq } from "drizzle-orm";

const MarathonController = {
    start_match: async (req: Request, res: Response) => {
        try {

            const { userID } = req.body;

            console.log(userID);

            if (!userID) {
                return res.status(409).json({ msg: "User ID is required" });
            }
            // get a random problem for the user
            const problemID = Math.floor(Math.random() * 10) + 1;
            const problem = await db.select().from(problems).where(eq(problems.problemID, problemID)).limit(1);

            // create the match
            const match = await db.insert(marathon_match).values({
                userID: userID,
                problems: [
                    {
                        id: problemID,
                        title : problem[0].title,
                        time_taken: 0
                    }
                ],
                total_time: '00:00:00',
                status: "ongoing"
            }).returning();
            console.log(match)
            return res.status(200).json({ msg: "Match started successfully", matchData : match[0] });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    update_problem: async  (req : Request, res : Response) => {
        try {

            const {userID , matchID, current_problems  } = req.body;

            if(!userID || !matchID) {
                return res.status(409).json({msg : "User ID and Match ID are required"})
            }   

            console.log(current_problems);

            let problemID ;
            let flag_to_break = true;
            while(flag_to_break) {
                problemID = Math.floor(Math.random() * 10) + 1;
                for(let i = 0; i < current_problems.length; i++) {
                    if(current_problems[i].id !== problemID) {
                        flag_to_break = false;
                        break;
                    }
                    
                }
                if(!flag_to_break) {
                    break;
                }
            }



            //@ts-ignore
            const problem = await db.select().from(problems).where(eq(problems.problemID, problemID)).limit(1);

            console.log(problem[0]);
            const newProblems = [...current_problems, {
                id: problemID,
                title : problem[0].title,
                time_taken: '00:00'
            }];

            // update the match
            const match = await db.update(marathon_match).set({
                problems: newProblems
            }).where(eq(marathon_match.id, matchID)).returning();
            console.log(match)
            return res.status(200).json({ msg: "Match updated successfully", problem : {
                id: problemID,
                title : problem[0].title,
                time_taken: 0
            } });

        } catch (error) {
            console.log(error);
            return res.status(500).json({msg : "Internal Server Error"})
        }
    },
    end_match : async (req: Request, res : Response) => {
        try {
            
            const { userID, matchID, problems , total_time} = req.body;

            if(!userID || !matchID) {
                return res.status(409).json({msg : "User ID and Match ID are required"})
            }   
            const match = await db.update(marathon_match).set({
                problems: problems,
                total_time: total_time,
                status: "completed"
            }).where(eq(marathon_match.id, matchID)).returning();
            console.log(match)
            return res.status(200).json({ msg: "Match ended successfully", matchData : match[0] });

        } catch (error) {
            console.log(error);
            return res.status(500).json({msg : "Internal Server Error"})
        }
    }
}

export default MarathonController;