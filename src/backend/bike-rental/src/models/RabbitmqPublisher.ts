import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import { RabbitmqClient } from "./RabbitmqClient";

class RabbitmqPublisher extends RabbitmqClient {
    constructor() { super(); }
    
    //TODO aggiungere i vari meccanismi di retry and fallback in caso di errore
    async publishEvent(exchange: string, routingKey: string, message: IOrderResponseDTO): Promise<boolean> {

      if (!this.channel) {
        await this.connect();
      }

      return this.channel.publish(
        exchange,
        routingKey, // No routing key needed for fanout
        Buffer.from(JSON.stringify(message)),
        {
          //TODO se necessario continuare a customizzare il channel
          appId: "BikerService",
        }
      );
    }

    // async sendToQueue(queue: string, message: any): Promise<boolean> {
    //     try {
    //       if (!this.channel) {
    //         await this.connect();
    //       }
    
    //       return this.channel.sendToQueue(queue, Buffer.from(message));
    //     } catch (error) {
    //       console.error("[BIKE SERVICE]", error);
    //       throw error;
    //     }
    // }
}

export const publisher = new RabbitmqPublisher;