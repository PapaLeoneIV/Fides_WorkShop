export default interface IOrderEntityDTO {
  id: string;
  userEmail: string;
  to: string;
  from: string;
  room: string;
  road_bike_requested: number;
  dirt_bike_requested: number;
  amount: string;
  bike_status: string;
  hotel_status: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
}
