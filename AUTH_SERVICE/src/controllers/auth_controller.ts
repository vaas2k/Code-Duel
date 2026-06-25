import { Request, Response } from 'express';
import { db } from '../database/db';
import { playerStatsHistory, users, userSessions } from '../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { sendEmail } from '../services/nodemailer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const authController = {
    createAccount: async (req: Request, res: Response) => {
        try {
            const { username, email, password, confirmPassword } = req.body;


            console.log(req.body);

            console.log('Create Account Request Body');
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).send('All fields are required');
            }

            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match');
            }


            const userNameExists = await db.select().from(users).where(eq(users.username, username));
            if (userNameExists.length > 0 && userNameExists[0].verified) {
                return res.status(400).json('Username already in use');
            }
            else {
                if (userNameExists.length > 0 && !userNameExists[0].verified) {
                    await db.delete(users).where(eq(users.username, username));
                }
            }

            const emailExists = await db.select().from(users).where(eq(users.email, email));
            console.log(emailExists[0]);
            if (emailExists.length > 0 && emailExists[0].verified == true) {
                return res.status(400).json('Email already in use');
            }
            else {
                if (emailExists.length > 0 && !emailExists[0].verified) {
                    await db.delete(users).where(eq(users.email, email));
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const code = Math.floor(1000 + Math.random() * 9000);
            const codeExpirey = new Date(Date.now() + 3 * 60 * 1000);

            // Send verification email
            const emailSent = await sendEmail(email, code);
            if (!emailSent) {
                return res.status(500).send('Error sending verification email');
            }

            await db.insert(users).values({
                username,
                email,
                password: hashedPassword,
                code,
                codeExpirey
            });

            return res.status(200).json({ message: 'User created successfully' });

        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).send('Internal Server Error');
        }
    },
    verifyAccount: async (req: Request, res: Response) => {
        try {

            const { email, code } = req.body;

            console.log("Verify Account Request Body", req.body);

            if (!email || !code) {
                return res.status(400).send('Email and code are required');
            }

            const user = await db.select().from(users).where(eq(users.email, email));

            console.log(user[0]);

            if (user[0]) {
                if (user[0].code === parseInt(code) && user[0].codeExpirey && user[0].codeExpirey > new Date()) {
                    await db.update(users).set({ verified: true, code: null, codeExpirey: null }).where(eq(users.email, email));
                }
                else {
                    return res.status(400).json({ message: 'Invalid or expired code' });
                }
            }
            else {
                return res.status(400).json({ message: 'Invalid email or code' });
            }


            await db.insert(playerStatsHistory).values({
                userID: user[0].id,
                username: user[0].username,
            });


            return res.status(200).json({ message: 'Account verified successfully' });

        } catch (error) {
                                                                                                                                                  console.error('Error verifying account:', error);
            return res.status(500).send('Internal Server Error');
        }
    },
    signIn: async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body;

            console.log(email, password);

            if (!email || !password) {
                return res.status(400).send('Email or Username and password are required');
            }

            if(email == 'admin@admin.com' && password == 'admin') {

                return res.status(200).json({msg : "Admin logged in successfully", userRole : "admin"});
                
            }

            const user = await db.select().from(users).where(eq(users.email, email));

            if (user.length === 0) {
                return res.status(400).send('Invalid email or password');
            }
            if (!user[0].verified) {
                return res.status(400).send('Account not verified');
            }


            const passwordMatch = await bcrypt.compare(password!, user[0]!.password!);
            if (!passwordMatch) {
                return res.status(400).send('Invalid email or password');
            }

            const isBanned = user[0].banned;

            if(isBanned) {
                return res.status(409).send('Banned');
            }


            const sessionID = uuidv4();
            const sessionExpiry = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
            // const hashedSessionID = crypto.createHash('sha256').update(rawSessionID).digest('hex');



            const getUserSession = await db.select().from(userSessions).where(eq(userSessions.userID, user[0].id));
            if (!getUserSession[0]) {

                await db.insert(userSessions).values({
                    sessionID: sessionID,
                    userID: user[0].id,
                    expiresAt: sessionExpiry,
                    revoked: false
                });
            } else {
                await db.update(userSessions).set(
                    {
                        sessionID: sessionID,
                        expiresAt: sessionExpiry,
                        revoked: false
                    })
                    .where(eq(userSessions.userID, user[0].id));
            }

            res.cookie('sessionID', sessionID, {
                httpOnly: true,
                // secure: true,
                sameSite: 'lax',
                expires: sessionExpiry
            });

            return res.status(200).json({
                user: {
                    id: user[0].id,
                    email: user[0].email,
                    username: user[0].username,
                    rating: user[0].rating
                }, message: 'Sign in successful'
            });

        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }
    },
    forgetPassword: async (req: Request, res: Response) => {
        try {
            // receive email
            const { email } = req.body;

            console.log(email);
            // check if email is valid and verified
            const emailExist = await db.select().from(users).where(eq(users.email, email));

            if (emailExist.length === 0) {
                return res.status(400).json({ msg: "Email does not exist" });
            }
            // generate a code and send to email

            const code = Math.floor(1000 + Math.random() * 9000);
            const codeExpirey = new Date(Date.now() + 3 * 60 * 1000);

            // Send verification email
            const emailSent = await sendEmail(email, code);
            if (!emailSent) {
                return res.status(501).send('Error sending verification email');
            }

            await db.update(users).set({ verified: false, code: code, codeExpirey: codeExpirey }).where(eq(users.email, email));
            // return success message
            return res.status(200).json({ msg: "Email sent successfully" });
        } catch (error) {
            console.error('Error in forgetPassword:', error);
            return res.status(500).send('Internal Server Error');
        }
    },
    resetPassword: async (req: Request, res: Response) => {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return res.status(400).json({ msg: "Email, password and confirm password are required" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

            return res.status(200).json({ msg: "Password changed successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    logoutAccount: async (req :any, res: Response) => {
        try {
            console.log("Logout request received");

            // 1. Read sessionID from cookies
            const sessionID = req.cookies?.sessionID;

            console.log(req.cookies);

            console.log(sessionID);

            if (!sessionID) {
                return res.status(401).json({ message: "No session found" });
            }

            // 2. Verify session in DB
            const session = await db.select().from(userSessions).where(eq(userSessions.sessionID, sessionID));

            if (session.length === 0 || session[0].revoked || (session[0].expiresAt && session[0].expiresAt < new Date())) {
                // If no valid session
                res.clearCookie("sessionID", {
                    httpOnly: true,
                    // secure: true,
                    sameSite: "lax",
                });
                return res.status(401).json({ message: "Invalid or expired session" });
            }

            // 3. Revoke session
            await db.update(userSessions)
                .set({ revoked: true })
                .where(eq(userSessions.sessionID, sessionID));

            // 4. Clear cookie
            res.clearCookie("sessionID", {
                httpOnly: true,
                // secure: true,
                sameSite: "lax",
            });

            return res.status(200).json({ message: "Logout Successful" });

        } catch (error) {
            console.error("Error in logout:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    authVerify: async (req: Request, res: Response) => {
        try {
            console.log('Auto Login');
            const sessionID = req.cookies?.sessionID;

            console.log(sessionID);
            if (!sessionID) {
                return res.status(401).json({ message: "No Session Found" });
            }

            const session = await db.select().from(userSessions).where(eq(userSessions.sessionID, sessionID));

            if (session.length === 0 || session[0].revoked) {
                return res.status(401).json({ message: "Invalid session" });
            }

            const now = new Date();

            // ❌ Expired session
            if (session[0].expiresAt && session[0].expiresAt < now) {
                await db.update(userSessions)
                    .set({ revoked: true })
                    .where(eq(userSessions.sessionID, sessionID));

                res.clearCookie("sessionID", {
                    httpOnly: true,
                    sameSite: "lax",
                    // secure: false, // set true in prod if using HTTPS
                });

                return res.status(401).json({ message: "Session expired" });
            }

            // // ✅ Valid session — refresh expiry for sliding session
            // const newExpiry = new Date(now.getTime() + 60 * 60 * 1000); // +1h
            // await db.update(userSessions)
            //     .set({ expiresAt: newExpiry })
            //     .where(eq(userSessions.sessionID, sessionID));

            // res.cookie("sessionID", sessionID, {
            //     httpOnly: true,
            //     sameSite: "lax",
            //     secure: false,
            //     expires: newExpiry,
            // });

            return res.status(200).json({ message: "Session valid" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

};

export default authController;