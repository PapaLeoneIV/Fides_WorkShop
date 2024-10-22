import {loginManager, rabbitmqClient} from "../models/index";
import { generateAccessToken, authenticateToken } from "../jwt/jwt";
import  {registration_schema, login_schema}  from "../zodschema/index";

interface LoginDTO {
    password: string;
    email: string;
    jwtToken?: string;
}
export async function handle_registration_req(msg: string) {
    let registration_info: {email: string, password: string, jwtToken?: string};

    try {
        const data = JSON.parse(msg);
        registration_info = registration_schema.parse(data);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }

    if (await loginManager.check_existance(registration_info.email)) {
        console.error("[AUTH SERVICE] User already exists");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "User already exists" }));
        return;
    }

    let user = await loginManager.register_user(registration_info);
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
    let login_info: {email: string, password: string, jwtToken?: string};
    let token: string;

    try {
        const data = JSON.parse(msg);
        login_info = login_schema.parse(data);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }

    if (await loginManager.check_existance(login_info.email)) {
        console.log("[AUTH SERVICE] User exists");
        let hashedPassword = await loginManager.get_user_password(login_info.email);
        if (hashedPassword) {
            if (await loginManager.compare_passwords(login_info.password, hashedPassword)) {
                console.log("[AUTH SERVICE] User logged in successfully");
                if (login_info.jwtToken) {
                    let jwtToken = authenticateToken(login_info.jwtToken);
                    if (jwtToken) {
                        console.log("[AUTH SERVICE] JWT Token is valid");
                        rabbitmqClient.sendLoginResp(JSON.stringify({ status: "APPROVED", error: "" }));
                        return;
                    }
                    else {
                        console.error("[AUTH SERVICE] JWT Token is invalid");
                        rabbitmqClient.sendLoginResp(JSON.stringify({ status: "ERROR", error: "JWT Token is invalid" }));
                        return;
                    }
                }
                token = generateAccessToken(login_info.email);
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
