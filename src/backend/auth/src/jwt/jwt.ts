import jwt from "jsonwebtoken";

export function generateAccessToken(email: string): string {
    return jwt.sign({email}, process.env.TOKEN_SECRET as string, { expiresIn: 1 } as jwt.SignOptions);
}

export function authenticateToken(token: string): string | object {
    return jwt.verify(token, process.env.TOKEN_SECRET as string);
}

