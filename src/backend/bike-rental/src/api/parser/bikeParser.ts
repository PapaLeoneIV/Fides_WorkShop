import { order as OrderDO } from "prisma/prisma-client"
import { z } from "zod"

const receive_data_schema = z.object({
  order_id: z.string(),
  road_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "[BIKE SERVICE] Must be a string representing a number greater than or equal to 0",
  }),
  dirt_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "[BIKE SERVICE] Must be a string representing a number greater than or equal to 0",
  }),
});

const revert_data_schema = z.object({
  order_id: z.string(),
});


interface OrderDTO {
  order_id: string,
  road_bike_requested: number,
  dirt_bike_requested: number,
  renting_status: string,
  created_at: Date,
  updated_at: Date
}

export const parse_and_set_default_values = async (data: any, schema: string): Promise<OrderDTO> => {
  if (schema === "RECEIVE_SCHEMA") {
    const parsedData = receive_data_schema.parse(data);
    return {
      order_id: data.order_id,
      road_bike_requested: parseInt(data.road_bike_requested, 10),
      dirt_bike_requested: parseInt(data.dirt_bike_requested, 10),
      renting_status: "PENDING",
      created_at: new Date(),
      updated_at: new Date(),
    } as OrderDTO;
  } else if (schema === "REVERT_SCHEMA") {
    const parsedData = revert_data_schema.parse(data);
    return {
      order_id: data.order_id,
      road_bike_requested: parseInt(data.road_bike_requested, 10),
      dirt_bike_requested: parseInt(data.dirt_bike_requested, 10),
      renting_status: "PENDING",
      created_at: new Date(),
      updated_at: new Date(),
    } as OrderDTO;
  } else {
    throw new Error("Invalid schema type provided");
  }
};

