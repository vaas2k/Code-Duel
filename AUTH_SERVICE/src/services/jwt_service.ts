import jwt, { SignOptions, VerifyErrors, JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.JWT_SECRET_TOKEN;
if (!secret) {
    throw new Error("Missing JWT_SECRET_TOKEN in environment variables");
}

class JWT {
    static signToken(payload: object, expiresIn: string | number = "1d"): string {
        const options: SignOptions = { expiresIn, algorithm: "HS256" };
        return jwt.sign(payload, secret, options);
    }

    static verifyToken(token: string): JwtPayload | string | null {
        try {
            return jwt.verify(token, secret) as JwtPayload;
        } catch (error) {
            console.error("Invalid JWT:", (error as VerifyErrors).message);
            return null;
        }
    }
}

export default JWT;