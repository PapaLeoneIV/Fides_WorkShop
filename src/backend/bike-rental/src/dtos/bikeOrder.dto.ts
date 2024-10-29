export default interface BikeOrderDTO {
    order_id: string,
    road_bike_requested: number,
    dirt_bike_requested: number,
    renting_status: string,
    created_at: Date,
    updated_at: Date
}