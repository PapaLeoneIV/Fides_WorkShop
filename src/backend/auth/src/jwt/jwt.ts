import jwt, {Secret} from "jsonwebtoken";
import process from "process";

export function generateAccessToken(username: string): string {
    return jwt.sign(username, process.env.TOKEN_SECRET as Secret, { expiresIn: '1800s' });
  }

export function authenticateToken(token: string): string | object {
    return jwt.verify(token, process.env.TOKEN_SECRET as Secret);
}

