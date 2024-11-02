interface HotelBindingKey {
    ConsumehotelOrder: string;
    ConsumehotelSAGAOrder: string;
    PublishhotelOrder: string;
    PublishhotelSAGAOrder: string;
}
export const Hotelconfig: HotelBindingKey = {
    ConsumehotelOrder: "BDhotel_request",
    ConsumehotelSAGAOrder: "BDhotel_SAGA_request",
    PublishhotelOrder: "hotel_main_listener",
    PublishhotelSAGAOrder: "hotel_saga_listener"
};  
