import { UserManager, UserDTO } from "../service/UserRepository";
import { RabbitClient } from "../router/rabbitMQClient";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";




//TODO use zod to ensure that they send valid datas
//name shold be 3-20 characters
//email should be valid
//password should be 8-20 characters




export async function handle_registration_req(msg: string) {

    const data: UserDTO = JSON.parse(msg);

    const User_manager = new UserManager();
    const rabbitmqClient = new RabbitClient();

    if (await User_manager.check_existance(data.username)) {
        console.error("[AUTH SERVICE] User already exists");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ error: "User already exists" }));
        return;
    }

    let user = await User_manager.register_user(data);
    if (user) {
        console.log("[AUTH SERVICE] User registered successfully");
        rabbitmqClient.sendRegistrationResp(JSON.stringify({ success: "User registered successfully" }));
        return;
    }
    console.log("[AUTH SERVICE] Failed to register user");
    rabbitmqClient.sendRegistrationResp(JSON.stringify({ error: "Failed to register user" }));
    return;
}


//TODO for each login request, check if the user should be an admin
// if so, attach a token with admin privilages
function generateAccessToken(username: string) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  }

export async function handle_login_req(msg: string) {
    const data: UserDTO = JSON.parse(msg);

    const User_manager = new UserManager();
    const rabbitmqClient = new RabbitClient();

    if (await User_manager.check_existance(data.username)) {
        console.log("[AUTH SERVICE] User exists");
        let hashedPassword = await User_manager.get_user_password(data.username);
        if (hashedPassword) {
            if (await bcrypt.compare(data.password, hashedPassword)) {
                console.log("[AUTH SERVICE] User logged in successfully");

                //TODO devo mandare il JWT token
                rabbitmqClient.sendLoginResp(JSON.stringify({ success: "User logged in successfully" }));
                return;
            }
            else {
                console.error("[AUTH SERVICE] Wrong password");
                rabbitmqClient.sendLoginResp(JSON.stringify({ error: "Wrong password" }));
                return;
            }
        }
    }
    else {
        console.error("[AUTH SERVICE] User does not exist");
        rabbitmqClient.sendLoginResp(JSON.stringify({ error: "User does not exist" }));
        return;
    }
}
