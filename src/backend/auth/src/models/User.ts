import { registered_users as UserEntity } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

interface UserPayload extends JwtPayload {
  email: string;
}

export class User {
  private _id: number;
  private _email: string;
  private _password: string;

  constructor(user: UserEntity | null) {
    if (!user) return;
    this._id = user.id;
    this._email = user.email;
    this._password = user.password;
  }

  get id(): number {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  static authenticateToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as UserPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  generateAccessToken(): string {
    return jwt.sign({ email: this.email }, process.env.TOKEN_SECRET as string, { expiresIn: '1800s' });
  }
}
