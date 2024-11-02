import { rabbitPub } from "../models";
import { DENIED } from "../config/status";

export async function parse_request(msg: string, schema: any) {
    try {
      return schema.parse((JSON.parse(msg)));
    } catch (error) {
      console.error(`[HOTEL SERVICE] Error while parsing message:`, error);
      await rabbitPub.publish_to_order_management({ id: "", status: DENIED });
      return;
    }
  
  }
  