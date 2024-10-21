import { PrismaClient, registered_users as UserDO } from "@prisma/client";
import bcrypt from 'bcrypt';

export interface UserDTO {
    password: string;
    email: string;
}

export class UserManager{
    private prisma: PrismaClient;
    constructor(){
        this.prisma = new PrismaClient();
    }
    
    async register_user(data: UserDTO) : Promise<UserDO>{ {
        let hashedPassword = await bcrypt.hash(data.password, process.env.BYCRYPT_HASH_SEED as string);
        return await this.prisma.registered_users.create({
            data: {
                password: hashedPassword,
                email: data.email
            }
        });
    }
    }

    async check_password(email: string, password: string) : Promise<boolean>{
        let user = await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        });
        if(user){
            return bcrypt.compare(password, user.password);
        }
        return false;
    }

    async get_user_password(email: string) : Promise<string>{
        let user = await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        });
        if(user){
            return user.password;
        }
        return "";
    }

    async check_existance(email: string) : Promise<boolean>{
        return await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        }) !== null;
    }

    async get_user(email: string) : Promise<UserDO | null> {
        return await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        });
    }

    
}