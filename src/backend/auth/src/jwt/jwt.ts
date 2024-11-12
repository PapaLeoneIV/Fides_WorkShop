import jwt, { JwtPayload }from "jsonwebtoken";

interface UserPayload extends JwtPayload {
    email: string;
}
export function generateAccessToken(email: string): string {
    return jwt.sign({email}, process.env.TOKEN_SECRET as string, {expiresIn: '1800s'});
}

export function authenticateToken(token: string) {
    try {
        console.log("Token secret:" , process.env.TOKEN_SECRET);
        let decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
        return decoded;
    } catch (error) {
        console.error("[TOKEN SERVICE] Invalid JWT Token:", error);
        return null;
    }
}


