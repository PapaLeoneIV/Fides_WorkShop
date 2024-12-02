import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import { RabbitmqClient } from "./RabbitmqClient";

class RabbitmqPublisher extends RabbitmqClient {
    constructor() { super(); }

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
                appId: "HotelService",
            }
        );
    }

    // async sendToQueue(queue: string, message: any): Promise<boolean> {
    //     try {
    //         if (!this.channel) {
    //         await this.connect();
    //         }

    //         return this.channel.sendToQueue(queue, Buffer.from(message));
    //     } catch (error) {
    //         logger.error("[ORDER SERVICE]", error);
    //         throw error;
    //     }

    // }
}

export const publisher = new RabbitmqPublisher;