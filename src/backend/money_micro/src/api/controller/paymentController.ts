import { PrismaPromise } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { z } from "zod";

const payment_schema = z.object({
    order_id: z.string(),
    amount: z.string(),
});


const send_payment = async (parsedBody: any): Promise<boolean> => {
  let res = Math.random() < 0.5 ? true : false;
  return res;
};

export const receive_order = async (
  req: Request,
  res: Response
): Promise<void> => {
  let parsedBody: any;
  try {
    parsedBody = payment_schema.parse(req.body);
  } catch (error) {
    console.log("Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }
  try {
    console.log("Sending payment...");
    let bank_response = await send_payment(parsedBody);
    if (bank_response) {
      console.log("Payment was succesfull!");
      res.send("PAYMENTAPPROVED");
    } else {
      console.log("Payment was denied!");
      res.send("PAYMENTDENIED");
    }
  } catch (error) {
    console.error("Error sending data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
