import { PrismaClient, registered_users as UserDO } from "@prisma/client";

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
                password: data.password,
                email: data.email
            }
        });
    }
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