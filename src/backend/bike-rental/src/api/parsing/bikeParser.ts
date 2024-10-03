import { z } from "zod";
import { bike_order } from "../service/bikeService";


export const parse_and_set_default_values = (data: any, schema : any) => {
  const parsedData = schema.parse(data);
  return {
    ...parsedData,
    renting_status: "PENDING",
    created_at: new Date(),
    updated_at: new Date(),
  } as bike_order;
};