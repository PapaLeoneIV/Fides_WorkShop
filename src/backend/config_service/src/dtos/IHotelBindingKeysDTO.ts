interface HotelBindingKey {
    ConsumeHotelOrder: string;
    ConsumeHotelSAGAOrder: string;
    PublishHotelOrder: string;
    PublishhotelSAGAOrder: string;
}
export const Hotelconfig: HotelBindingKey = {
    ConsumeHotelOrder: "BDhotel_request",
    ConsumeHotelSAGAOrder: "BDhotel_SAGA_request",
    PublishHotelOrder: "hotel_main_listener",
    PublishhotelSAGAOrder: "hotel_saga_listener"
};  
