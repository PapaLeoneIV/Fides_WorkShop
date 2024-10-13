import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface hotel_order {
  id: string;
  order_id: string;
  to: string;
  from: string;
  room: string;
  renting_status: string;
  created_at: Date;
  updated_at: Date;
}

export class HotelOrder {
  public info: hotel_order;

  constructor(info: hotel_order) {
    this.info = info;
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Creating new hotel order object with id: ", info.order_id);
  }

  public get id(): string {
    return this.info.id;
  }

  public get order_id(): string {
    return this.info.order_id;
  }

  public get to(): string {
    return this.info.to
  }

  public get from(): string {
    return this.info.to
  }

  public get room(): string {
    return this.info.room
  }

  public get renting_status(): string {
    return this.info.renting_status;
  }

  public get created_at(): Date {
    return this.info.created_at;
  }

  public get updated_at(): Date {
    return this.info.updated_at;
  }
}



