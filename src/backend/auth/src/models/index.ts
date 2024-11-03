import LoginManager from "./login";
import {RabbitSub, RabbitPub}  from "./rabbit";

const rabbitSub = new RabbitSub();
const rabbitPub = new RabbitPub();
const loginManager = new LoginManager();

export  {

    loginManager,
    rabbitSub,
    rabbitPub
};