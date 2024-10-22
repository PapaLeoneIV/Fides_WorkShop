import { rabbitmqClient } from "../models";

export type INotification = {
  title: string;
  description: string;
};


export const sendNotification = async (notification: INotification, queue: string) => {
 
  rabbitmqClient.sendToQueue(queue, notification);

  console.log(`[AUTH SERVICE]Sent the notification to consumer`);
};