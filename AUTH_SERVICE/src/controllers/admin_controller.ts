import { Request, Response } from "express";
import { db } from "../database/db";
import { feedbacks, match, problems, users, userSessions } from "../database/schema";
import { gte, eq, desc, sql } from "drizzle-orm";
// const statements = require("../services/CodeChecking/problems/statments/statements");
import getTotalTestCases from "../services/CodeChecking/getLenforTestCases";
import fs from "fs";
import path from "path";


interface Problem {
    id : number
    problemID: number;
    title: string;
    statement: string;
    input: string;
    output: string;
    constraints: string;
    testCases: { input: string; output: string }[];
}

const AdminController = {
    // AdminController.ts - stats function
stats: async (req: Request, res: Response) => {
    try {
        console.log("Fetching stats...");

        const [totalUsersResult, activeUsers24hResult, totalMatchesResult, matchesTodayResult, totalFeedbackResult, feedbackResolvedResult, bannedUsersResult] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(users),
            db.select({ count: sql<number>`count(*)` }).from(userSessions).where(gte(userSessions.createdAt, new Date(Date.now() - 86400000))),
            db.select({ count: sql<number>`count(*)` }).from(match),
            db.select({ count: sql<number>`count(*)` }).from(match).where(gte(match.createdAt, new Date(Date.now() - 86400000))),
            db.select({ count: sql<number>`count(*)` }).from(feedbacks),
            db.select({ count: sql<number>`count(*)` }).from(feedbacks).where(eq(feedbacks.resolved, true)),
            db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.banned, true))
        ]);

        const getStats = {
            totalUsers: Number(totalUsersResult[0]?.count || 0),
            activeUsers24h: Number(activeUsers24hResult[0]?.count || 0),
            totalMatches: Number(totalMatchesResult[0]?.count || 0) - 1, // Subtract 1 as you had
            matchesToday: Number(matchesTodayResult[0]?.count || 0),
            totalFeedback: Number(totalFeedbackResult[0]?.count || 0),
            feedbackResolved: Number(feedbackResolvedResult[0]?.count || 0),
            bannedUsers: Number(bannedUsersResult[0]?.count || 0)
        };

        console.log(getStats);
        return res.status(200).json({ getStats });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
},
    users: async (req: Request, res: Response) => {
        try {
            const getUsers = await db.select({
                id: users.id,
                username: users.username,
                email: users.email,
                rating: users.rating,
                verified: users.verified,//@ts-ignore
                // createdAt: users.createdAt,//@ts-ignore
                // updatedAt: users.updatedAt,
                banned: users.banned
            }).from(users);

            return res.status(200).json({ getUsers });

        } catch (error) {
            console.error("Error in users:", error);
            return res.status(500).json({ msg: "Internal Server Error", error: String(error) });
        }
    },
    feedbacks: async (req: Request, res: Response) => {
        try {

            const getFeedbacks = await db.select().from(feedbacks);
            // console.log(getFeedbacks);
            return res.status(200).json({ getFeedbacks });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    matches: async (req: Request, res: Response) => {
        try {

            const getMatches = await db.select().from(match);
            // console.log(getMatches);
            return res.status(200).json({ getMatches });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    problems: async (req: Request, res: Response) => {
        try {

            const getStatements = await db.select().from(problems);

            const newStatments = getStatements.map((statement: any) => {
                const hiddenTestCasesCount = getTotalTestCases(statement.problemID);
                return { ...statement, hiddenTestCasesCount };
            })

            return res.status(200).json({ problems: newStatments });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    add_problem: async (req: Request, res: Response) => {
        try {

            const { title, statement, inputDescription, outputDescription, constraints, sampleTestCases } = req.body;

            console.log(req.body.title);

            const lastId = await db.select().from(problems).orderBy(desc(problems.problemID));

            // console.log(lastId);
            const newProblem: Problem = {
                id: lastId[0].problemID + 1,
                problemID: lastId[0].problemID + 1,
                title,
                statement,
                input: inputDescription,
                output: outputDescription,
                constraints,
                testCases: [
                    sampleTestCases[0].input,
                    sampleTestCases[0].output
                ]
            }

            await db.insert(problems).values(newProblem);



            return res.status(200).json({ msg: "Problem added successfully", problem: newProblem });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    update_problem: async (req: Request, res: Response) => {
        try {

            const { problemData } = req.body;

            await db.update(problems).set({
                title: problemData.title,
                statement: problemData.statement,
                constraints: problemData.constraints,
                input: problemData.inputDescription,
                output: problemData.outputDescription
            }).where(eq(problems.id, problemData.id));

            console.log(problemData);

            return res.status(200).json({ msg: "Problem updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    delete_problem: async (req: Request, res: Response) => {
        try {
            const { id } = req.body;

            console.log(id);
            await db.delete(problems).where(eq(problems.id, id));

            return res.status(200).json({ msg: "Problem deleted successfully" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    addTestCases: async (req: Request, res: Response) => {
        try {
            const { problemId, testCase } = req.body;

            if (!problemId || !testCase || !testCase.input || !testCase.output) {
                return res.status(400).json({ msg: "Missing required fields: problemId, testCase.input, testCase.output" });
            }
            const testCaseDir = path.resolve(__dirname, `../services/CodeChecking/problems/tests/${problemId}`);

            if (!fs.existsSync(testCaseDir)) {
                console.log("Directory doesn't exist, creating:", testCaseDir);
                fs.mkdirSync(testCaseDir); // recursive: true creates parent directories if needed
            }

            // Get total number of existing test cases
            const testCaseNumber = getTotalTestCases(problemId) + 1;

            // Create file paths
            const inputFilePath = path.join(testCaseDir, `${testCaseNumber}.in`);
            const outputFilePath = path.join(testCaseDir, `${testCaseNumber}.out`);

            // Write test case files (OVERWRITE mode, not append)
            fs.writeFileSync(inputFilePath, testCase.input, 'utf8');
            fs.writeFileSync(outputFilePath, testCase.output, 'utf8');

            console.log(`Test case ${testCaseNumber} added successfully`);
            console.log(`Input file: ${inputFilePath}`);
            console.log(`Output file: ${outputFilePath}`);

            return res.status(200).json({
                msg: "Test case added successfully",
                testCaseNumber,
                totalTestCases: testCaseNumber
            });

        } catch (error) {
            console.error("Error adding test case:", error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    userActivity: async (req: Request, res: Response) => {
        try {

            const { userId, ban, type } = req.body;

            if (type === "ban") {
                await db.update(users).set({ banned: true }).where(eq(users.id, userId));
            }
            else if (type == "unban") {
                await db.update(users).set({ banned: false }).where(eq(users.id, userId));
            }

            return res.status(200).json({ msg: "User activity updated successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    feedbackActivity: async (req: Request, res: Response) => {
        try {

            const { feedbackId, type } = req.body;

            if (type == 'resolve') {
                await db.update(feedbacks).set({ resolved: true }).where(eq(feedbacks.id, feedbackId));
            }

            return res.status(200).json({ msg: "Feedback activity updated successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }
}


export default AdminController;