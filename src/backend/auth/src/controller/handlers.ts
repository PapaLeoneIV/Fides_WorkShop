import { UserManager, UserDTO } from "../service/UserRepository";
import { RabbitClient } from "../router/rabbitMQClient";
import bcrypt from 'bcrypt';
import { z } from "zod";
import { generateAccessToken } from "../jwt/jwt";

const registration_and_login_schema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
});

export async function handle_registration_req(msg: string) {
    let registration_info: UserDTO;
    const User_manager = new UserManager();
    const rabbitmqClient = new RabbitClient();

    try {
        const data = JSON.parse(msg);
        const description = JSON.parse(data.description);
        registration_info = registration_and_login_schema.parse(description);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }


    if (await User_manager.check_existance(registration_info.email)) {
        console.error("[AUTH SERVICE] User already exists");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "User already exists" }));
        return;
    }

    let user = await User_manager.register_user(registration_info);
    if (user) {
        console.log("[AUTH SERVICE] User registered successfully");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "APPROVED", error: "User registered successfully" }));
        return;
    }
    console.log("[AUTH SERVICE] Failed to register user");
    rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Failed to register user" }));
    return;
}

export async function handle_login_req(msg: string) {
    let registration_info: UserDTO;
    let token: string;
    const User_manager = new UserManager();
    const rabbitmqClient = new RabbitClient();

    try {
        const data = JSON.parse(msg);
        const description = JSON.parse(data.description);
        registration_info = registration_and_login_schema.parse(description);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }

    if (await User_manager.check_existance(registration_info.email)) {
        console.log("[AUTH SERVICE] User exists");
        let hashedPassword = await User_manager.get_user_password(registration_info.email);
        if (hashedPassword) {
            if (await bcrypt.compare(registration_info.password, hashedPassword)) {
                console.log("[AUTH SERVICE] User logged in successfully");

                token = generateAccessToken(registration_info.email);
                rabbitmqClient.sendLoginResp(JSON.stringify({ status: "APPROVED", token: token }));
                return;
            }
            else {
                console.error("[AUTH SERVICE] Wrong password");
                rabbitmqClient.sendLoginResp(JSON.stringify({ status: "ERROR", error: "Wrong password" }));
                return;
            }
        }
    }
    else {
        console.error("[AUTH SERVICE] User does not exist");
        rabbitmqClient.sendLoginResp(JSON.stringify({ status: "ERROR", error: "User does not exist" }));
        return;
    }
}
