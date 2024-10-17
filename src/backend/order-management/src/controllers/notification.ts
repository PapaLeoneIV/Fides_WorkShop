import {rabbitmqClient} from "../router/rabbitMQClient";

export type INotification = {
  title: string;
  description: string;
};


export const sendNotification = async (notification: INotification, queue: string) => {
 
  rabbitmqClient.sendToQueue(queue, notification);

};