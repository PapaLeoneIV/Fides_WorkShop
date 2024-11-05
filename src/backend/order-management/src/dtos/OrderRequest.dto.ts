export interface OrderRequestDTO {
    userJWT: string;
    userEmail: string;
    from: string;
    to: string;
    room: string;
    amount: string;
    road_bike_requested: number;
    dirt_bike_requested: number;
    bike_status: string;
    hotel_status: string;
    payment_status: string;
    created_at: Date;
    updated_at: Date;
  }
  