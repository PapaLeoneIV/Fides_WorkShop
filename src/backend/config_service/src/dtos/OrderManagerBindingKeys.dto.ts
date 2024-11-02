interface OrderManagerBindingKey {
    ConsumeBookingOrder: string;

    ConsumeBikeOrder: string;
    ConsumeBikeSAGAOrder: string;
    PublishBikeOrder: string;
    PublishbikeSAGAOrder: string;

    ConsumeHotelOrder: string;
    ConsumeHotelSAGAOrder: string;
    PublishHotelOrder: string;
    PublishhotelSAGAOrder: string;

    ConsumePaymentOrder: string;
    PublishPaymentOrder: string;

}

export const Orderconfig: OrderManagerBindingKey = {
    ConsumeBikeOrder: "BDbike_request",
    ConsumeBikeSAGAOrder: "BDbike_SAGA_request",
    PublishBikeOrder: "bike_main_listener",
    PublishbikeSAGAOrder: "bike_saga_listener",
    ConsumeBookingOrder: "booking_order_listener",
    ConsumeHotelOrder: "BDhotel_request",
    ConsumeHotelSAGAOrder: "BDhotel_SAGA_request",
    PublishHotelOrder: "hotel_main_listener",
    PublishhotelSAGAOrder: "hotel_saga_listener",
    ConsumePaymentOrder: "BDpayment_request",
    PublishPaymentOrder: "payment_main_listener"

};