import { loginManager, rabbitPub } from "../models/index";
import { generateAccessToken, authenticateToken } from "../jwt/jwt";
import { registration_schema, login_schema } from "../zodschema/index";

interface LoginDTO {
    password: string;
    email: string;
    jwtToken?: string;
}
export async function handle_registration_req(msg: string) {
    let registration_info: LoginDTO;

    try {
        const data = JSON.parse(msg);
        registration_info = registration_schema.parse(data);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitPub.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }

    if (await loginManager.check_existance(registration_info.email)) {
        console.error("[AUTH SERVICE] User already exists");
        rabbitPub.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "User already exists" }));
        return;
    }

    let user = await loginManager.register_user(registration_info);
    if (user) {
        console.log("[AUTH SERVICE] User registered successfully");
        rabbitPub.sendRegistrationResp(JSON.stringify({ status: "APPROVED", error: "User registered successfully" }));
        return;
    }
    console.log("[AUTH SERVICE] Failed to register user");
    rabbitPub.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Failed to register user" }));
    return;
}

export async function handle_login_req(msg: string) {
    let req_info: LoginDTO;
    let token: string;

    try {
        const data = JSON.parse(msg);
        req_info = login_schema.parse(data);
    } catch (error) {
        console.log("[AUTH SERVICE] Invalid data format");
        rabbitPub.sendRegistrationResp(JSON.stringify({ status: "ERROR", error: "Invalid data format" }));
        return;
    }
    const emailExist = await loginManager.check_existance(req_info.email);
    if (!emailExist) {
        console.error("[AUTH SERVICE] User does not exist");
        rabbitPub.sendLoginResp(JSON.stringify({ status: "ERROR", error: "User does not exist" }));
        return;
    }

    console.log("[AUTH SERVICE] User was found");

    let hashedPassword = await loginManager.get_user_password(req_info.email);

    let passwordMatch = await loginManager.compare_passwords(req_info.password, hashedPassword);
    if (!passwordMatch) {
        console.error("[AUTH SERVICE] Wrong password");
        rabbitPub.sendLoginResp(JSON.stringify({ status: "ERROR", error: "Wrong password" }));
        return;
    }

    console.log("[AUTH SERVICE] User logged in successfully");

    if (!req_info.jwtToken) {
        console.log("[AUTH SERVICE] JWT Token not provided");
        rabbitPub.sendLoginResp(JSON.stringify({ status: "ERROR", error: "JWT Token not provided" }));
        return;
    }
    let isJWTValid = authenticateToken(req_info.jwtToken);
    if (!isJWTValid) {
        console.error("[AUTH SERVICE] JWT Token is invalid");
        rabbitPub.sendLoginResp(JSON.stringify({ status: "ERROR", error: "JWT Token is invalid" }));
        return;
    }
    token = generateAccessToken(req_info.email);
    rabbitPub.sendLoginResp(JSON.stringify({ status: "APPROVED", token: token }));
    return;
}

export async function handle_user_info_req(msg: string){
    
}