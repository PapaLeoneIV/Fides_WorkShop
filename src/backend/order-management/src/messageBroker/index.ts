import mqConnection from "./connection";
import { sendNotification } from "./notification";
import { BIKE_QUEUE, HOTEL_QUEUE, PAYMENT_QUEUE } from "./config";


export const sendToBikeMessageBroker = async (body: Buffer) => {
  await mqConnection.connect();

  const newNotification = {
    title: "Bike order incoming",
    description: body,
  };

  sendNotification(newNotification, BIKE_QUEUE);
};


export const sendToHotelMessageBroker = async  (body: Buffer) => {
    await mqConnection.connect();
  
    const newNotification = {
      title: "Hotel order incoming",
      description: body,
    };
  
    sendNotification(newNotification, HOTEL_QUEUE);
  };


  export const sendToPaymentMessageBroker = async  (body: Buffer) => {
    await mqConnection.connect();
  
    const newNotification = {
      title: "Hotel order incoming",
      description: body,
    };
  
    sendNotification(newNotification, PAYMENT_QUEUE);
  };
  


