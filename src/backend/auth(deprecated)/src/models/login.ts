import { PrismaClient, registered_users as UserEntity } from "@prisma/client";

import bcrypt from 'bcrypt';

class LoginManager{
    private prisma: PrismaClient;
    constructor(){
        this.prisma = new PrismaClient();
    }
    
    async register_user(data: { email: string, password: string }) : Promise<UserEntity>{ {
        const saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        let hashedPassword = await bcrypt.hash(data.password, salt);
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
        let user =  await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        });
        if(user){
            return true;
        }
        return false;
    }

    async get_user(email: string) : Promise<UserEntity | null> {
        return await this.prisma.registered_users.findUnique({
            where: {
                email: email
            }
        });
    }

    async compare_passwords(password: string, hashedPassword: string) : Promise<boolean>{
        return await bcrypt.compare(password, hashedPassword);
    }

    
}

export default LoginManager;
