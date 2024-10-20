import { PrismaClient, registered_users as UserDO } from "@prisma/client";
import bcrypt from 'bcrypt';

export interface UserDTO {
    username: string;
    password: string;
    email: string;
}

export class UserManager{
    private prisma: PrismaClient;
    constructor(){
        this.prisma = new PrismaClient();
    }
    
    async register_user(data: UserDTO) : Promise<UserDO>{ {
        return await this.prisma.registered_users.create({
            data: {
                username: data.username,
                password: await bcrypt.hash(data.password, process.env.BYCRYPT_SALT),
                email: data.email
            }
        });
    }
    }

    async check_password(username: string, password: string) : Promise<boolean>{
        let user = await this.prisma.registered_users.findUnique({
            where: {
                username: username
            }
        });
        if(user){
            return bcrypt.compare(password, user.password);
        }
        return false;
    }

    async get_user_password(username: string) : Promise<string>{
        let user = await this.prisma.registered_users.findUnique({
            where: {
                username: username
            }
        });
        if(user){
            return user.password;
        }
        return "";
    }

    async check_existance(username: string) : Promise<boolean>{
        return await this.prisma.registered_users.findUnique({
            where: {
                username: username
            }
        }) !== null;
    }

    async get_user(username: string) : Promise<UserDO | null> {
        return await this.prisma.registered_users.findUnique({
            where: {
                username: username
            }
        });
    }

    
}