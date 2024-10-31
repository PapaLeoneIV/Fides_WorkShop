import { z } from 'zod';
import { z } from "zod";

// Define your date fields with transformation
const dateSchema = z.preprocess((arg) => {
  return typeof arg === "string" ? new Date(arg) : arg;
}, z.date());

const order_info_schema = z.object({
    from: z.string(),
    to: z.string(),
    room: z.string().refine((val) => {
      if (parseInt(val) === null) {
        console.log("[ORDER SERVICE]Room number is required");
      }
      const roomNumber = val !== null ? parseInt(val) : -1;
      if (roomNumber === -1) {
        console.log("[ORDER SERVICE]Room number is required", roomNumber);
        return false;
      }
      return roomNumber >= 101 && roomNumber <= 105;
    }, { message: "[ORDER SERVICE] Room number must be between 101 and 105" }),
  
    road_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
    dirt_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
  
    amount: z.string(),
  
    bike_status: z.string().refine((val) => {return val === "PENDING"},{message: "Bike status must be PENDING"}),
    hotel_status: z.string().refine((val) => {return val === "PENDING"},{message: "Hotel status must be PENDING"}),
    payment_status: z.string().refine((val) => {return val === "PENDING"},{message: "Payment status must be PENDING"}),
  
    created_at: dateSchema,
    updated_at: dateSchema
  });
  
  

  export {
    order_info_schema,
  }
 