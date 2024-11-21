export default interface IHotelRequestDTO {
    order_id: string,
    userEmail: string,
    to: string,
    from: string,
    room: string,
    renting_status: string,
    created_at: Date,
    updated_at: Date
}