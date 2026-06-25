import { Response, Request } from "express";
import axios, { AxiosError } from "axios";
import getInputandOutputfromFolder from "../services/CodeChecking/input_output_testcase";
import sendToJudge0 from "../services/CodeChecking/batch_submission";
import pollGetResults from "../services/CodeChecking/getsubmissions";
import { analyzeJudge0Statuses, calculateStatistics } from "../services/CodeChecking/analyzeandstats";
import getTotalTestCases from "../services/CodeChecking/getLenforTestCases";
import { socket } from "..";
import { problems } from "../database/schema";
import { eq } from "drizzle-orm";
import { db } from "../database/db";

const codeCheck_Controller = {
    async runSampleTestCases(req: Request, res: Response) {
        try {

        } catch (error) {
            console.log(error)
            if (error instanceof AxiosError) {

                return res.status(401).json({ nmsg: "Something wrong insdide the code checker" });
            }
            return res.status(200).json({ msg: "Internal Server Error" });
        }
    },
    async runAllTestCases(req: Request, res: Response) {
        try {
            const { language, code, problemID, userID, roomID } = req.body;

            console.log(language, problemID, userID, roomID);
            let langauge_id = 0;
            switch (language) {
                case 'cpp':
                    langauge_id = 54;
                    break;
                case 'java':
                    langauge_id = 62;
                    break;
                case 'python':
                    langauge_id = 71;
                    break;
                case 'javascript':
                    langauge_id = 63;
                    break;
                default:
                    return res.status(200).json({
                        passed: 0,
                        total: 0,
                        time: 0,
                        memory: 0,
                        error: 'Language not Supported!'
                    });
            }

            // will get all the testCases related to the problem from the test folder
            const inputs_outputs = await getInputandOutputfromFolder(problemID);
            // sending all the testCase, along with the user code and language to judge0 (compiler and code validator)
            const tokens = await sendToJudge0(inputs_outputs, code, langauge_id);
            // then we will get the results of the test cases
            const outputs: any = await pollGetResults(tokens);
            // get total testCases
            const total_cases = outputs.length;

            // now here we check the output for possible errors (runtime, syntax error etc);
            const statusAnalysis = analyzeJudge0Statuses(outputs);

            // If there are critical errors
            // if (statusAnalysis.hasCriticalError) {
            //     console.log(statusAnalysis);
            //     return res.status(201).json({
            //         passed: 0,
            //         total: total_cases,
            //         time: 0,
            //         memory: 0,
            // error: statusAnalysis.primaryError,
            // details: statusAnalysis.errorDetails,
            // testCaseDetails: statusAnalysis.testCaseDetails
            //     });
            // }

            // Calculate statistics like total time taken to run code on eaach test case amd its space memory BigO
            const stats = calculateStatistics(outputs, inputs_outputs.length);

            // Prepare response data
            const data = {
                passed: stats.passed,
                total: total_cases,
                time: stats.avgTime,
                memory: stats.avgMemory,
                message: stats.warnings.length > 0 ? { warnings: stats.warnings } : null,
                detailedSummary: {
                    correct: stats.passed,
                    wrong: stats.wrong,
                    runtime: stats.avgTime + 's',
                    memory: stats.avgMemory + 'KB'
                },
                testCaseDetails: statusAnalysis.testCaseDetails,
                error: statusAnalysis.primaryError,
                details: statusAnalysis.errorDetails,
            };

            // sending the testCase result to the other player to inform them about opponent have passed 
            // that much testCases
            socket.emit(`codeCheckResult:${roomID}`, {
                userID: userID,
                roomID: roomID,
                passed: stats.passed,
                total: total_cases,
                time: stats.avgTime
            });


            // return data to the requested user
            console.log('Success response:', data);
            return res.status(200).json(data);

        } catch (error) {
            console.log('Error in runAllTestCases:', error);

            // Return consistent error format
            return res.status(500).json({
                passed: 0,
                total: 0,
                time: 0,
                memory: 0,
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    },
    getProblem : async (req: Request, res: Response) =>{
        try {

            const {problemID} = req.body;

            const problem = await db.select().from(problems).where(eq(problems.problemID, problemID)).limit(1);
            
            console.log(problem);

            return res.status(200).json({problem : problem[0]});

        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }
}

export default codeCheck_Controller;


// if (output == 401) {
//     return res.status(201).json({ error: 'CE' });
// }

// // Finding the number of wrong answers and calculating averages
// let wrong = 0, avg_time = 0, avg_memory = 0, RTE = false, TLE = false;

// for (let i = 0; i < output.length; i++) {
//     avg_memory += output[i].memory;
//     avg_time += Number(output[i].time); // Ensure time is converted to a number

//     if (output[i].status.id === 4) {
//         wrong++;
//     }
//     if (Number(output[i].time) >= 1) { // Ensure comparison is done with a number
//         TLE = true;
//     }
//     if (output[i].status.id == 6) {
//         return res.status(201).json({ error: 'CE' });
//     }
//     if (output[i].status.id >= 7 && output[i].status.id <= 12) {
//         RTE = true;
//     }
// }

// // Correcting the average calculation
// const totalItems = output.length;
// const avg_time_calc = avg_time / totalItems;
// const avg_memory_calc = avg_memory / totalItems;

// const data = {
//     userid: req.body.userid,
//     type: req.body.type,
//     passed: (inputs_outputs.length - 1) - wrong,
//     total: (inputs_outputs.length - 1),
//     time: avg_time_calc,
//     memory: avg_memory_calc,
//     message: {
//         RTE: RTE ? 'RTE' : null,
//         TLE: TLE ? 'TLE' : null
//     }
// };

// console.log(data);
// return res.status(200).json(data);
