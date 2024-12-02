export default interface IOrderRequestDTO {
    order_id: string,
    userEmail: string,
    road_bike_requested: number,
    dirt_bike_requested: number,
    renting_status: string,
    created_at: Date,
    updated_at: Date
}