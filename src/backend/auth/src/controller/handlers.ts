import { UserManager, UserDTO } from "../service/UserRepository";
import { RabbitClient } from "../router/rabbitMQClient";
import bcrypt from 'bcrypt';



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

export async function handle_login_req(msg: string) {
    const data: UserDTO = JSON.parse(msg);

    const User_manager = new UserManager();
    const rabbitmqClient = new RabbitClient();

    let user = await User_manager.get_user(data.username);
    if (user && ((user.password === data.password && user.username === data.username) 
        || (user.password === data.password && user.email === data.email))) {
        console.log("[AUTH SERVICE] User logged in successfully");
        rabbitmqClient.sendLoginResp(JSON.stringify({ success: "User logged in successfully" }));
        return;
    }
    console.error("[AUTH SERVICE] Invalid credentials");
    rabbitmqClient.sendLoginResp(JSON.stringify({ error: "Invalid credentials" }));
    return;
}