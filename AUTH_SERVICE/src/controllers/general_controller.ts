import { Request, Response } from "express";
import { db } from "../database/db";
import { feedbacks } from "../database/schema";

const generalController = {
    addFeedback: async (req: Request, res: Response) => {
        try {

            const { userID, issueType, title, description, email, severity, anonymous , includeScreenshot } = req.body;
            console.log({
                userID,
                issueType,
                title,
                description,
                email,
                severity,
                anonymous,
                includeScreenshot
            });

            if (!userID || !issueType || !title || !description || !email || !severity) {
                
                console.log("all fields are required");
                return res.status(400).json({ message: "All fields are required" });
            }



            await db.insert(feedbacks).values({
                userID,
                issueType,
                title,
                description,
                email,
                severity,
                anonymous,
                includeScreenshot
            })

            return res.status(200).json({ msg: "Feedback added successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }
}

export default generalController