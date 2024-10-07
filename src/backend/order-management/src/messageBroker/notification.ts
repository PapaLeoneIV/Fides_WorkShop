import mqConnection from "./connection";

export type INotification = {
  title: string;
  description: Buffer;
};

export const sendNotification = async (notification: INotification, queue : string) => {
  await mqConnection.sendToQueue(queue, notification);

  console.log(`Sent the notification to consumer`);
};