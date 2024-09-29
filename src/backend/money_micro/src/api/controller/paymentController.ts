import { PrismaPromise } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { z } from "zod";

const payment_schema = z.object({
  orderID: z.string(),
  card: z.string(),
  cvc: z.string(),
  expire_date: z.string(),
  amount: z.string(),
});

const send_payment = async (parsedBody: any): Promise<string> => {
  let res = Math.random() < 0.5 ? "PAYMENTAPPROVED" : "PAYMENTDENIED";
  console.log("Payment sent:", parsedBody);
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
    let tmpResponse = await send_payment(parsedBody);
    if (tmpResponse === "PAYMENTAPPROVED") {
      res.send("PAYMENTAPPROVED");
    } else {
      res.send("PAYMENTDENIED");
    }
  } catch (error) {
    console.error("Error sending data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
