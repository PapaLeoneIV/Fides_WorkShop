import LoginManager from "./login";
import RabbitClient  from "./rabbit";

const rabbitmqClient = new RabbitClient();
const loginManager = new LoginManager();

export  {

    loginManager,
    rabbitmqClient

};