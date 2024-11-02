import { response_schema } from './service_res_schema';

export function parse_data_from_response(msg: string) {
    try {
      const data = response_schema.parse(JSON.parse(msg));
      return data;
    }
    catch (error) {
      console.error(`[ORDER SERVICE] Error while parsing response:`, error);
      throw new Error(`[ORDER SERVICE] Error while parsing response: ${error}`);
    }
  }
  