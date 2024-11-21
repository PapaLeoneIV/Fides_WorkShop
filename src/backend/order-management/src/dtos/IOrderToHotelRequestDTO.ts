export interface IOrderToHotelRequestDTO {
    userEmail: string,
    order_id: string,
    to: string,
    from: string,
    room: string,
    renting_status: string,
    created_at: Date,
    updated_at: Date
}