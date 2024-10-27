import {RabbitPublisher, RabbitSubscriber} from "./rabbit";


const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();


export {
    rabbitPub,
    rabbitSub
}