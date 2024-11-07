import jwt, { JwtPayload }from "jsonwebtoken";

interface UserPayload extends JwtPayload {
    email: string;
}
export function generateAccessToken(email: string): string {
    return jwt.sign({email}, process.env.TOKEN_SECRET as string, { expiresIn: 3000 } as jwt.SignOptions);
}

export function authenticateToken(token: string) {
    try {
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
        return decoded;
    } catch (error) {
        console.error("[TOKEN SERVICE] Invalid JWT Token:", error);
        return null;
    }
}


