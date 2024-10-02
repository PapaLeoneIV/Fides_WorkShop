import { hotel_order } from "../service/hotelService";
export const parse_and_set_default_values = (data: any, schema : any) => {
  const parsedData = schema.parse(data);
  return {
    ...parsedData,
    renting_status: "PENDING",
    created_at: new Date(),
    updated_at: new Date(),
  } as hotel_order;
};