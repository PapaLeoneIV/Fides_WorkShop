
import { DENIED } from "../config/status";
import { rabbitPub } from "../models";


export async function parse_request(msg: string, schema: any) {
    try {
      let parsedMessage = JSON.parse(msg);
      if (typeof parsedMessage === "string") return parsedMessage;
      else return schema.parse(parsedMessage);
    } catch (error) {
      console.error(`[BIKE SERVICE] Error while parsing message:`, error);
      rabbitPub.publish_to_order_management({ id: "", status: DENIED });
      throw new Error("Error while parsing message");
    }
  }