import mqConnection from "./connection";

export type INotification = {
  title: string;
  description: string;
};


export const sendNotification = async (notification: INotification, queue: string): Promise<boolean> => {
 
  let res = await mqConnection.sendToQueue(queue, notification);

  console.log(`Sent the notification to consumer`);
  return res;
};