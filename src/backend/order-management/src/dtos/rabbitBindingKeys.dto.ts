export interface RabbitBindingKeysDTO {
    ConsumeBikeOrder: string,
    ConsumeBikeSAGAOrder: string
    PublishBikeOrder: string,
    PublishbikeSAGAOrder: string,

    ConsumeHotelOrder: string,
    ConsumeHotelSAGAOrder: string,
    PublishHotelOrder: string,
    PublishhotelSAGAOrder: string,
    
    ConsumePaymentOrder: string,
    PublishPaymentOrder: string,
    
    ConsumeBookingOrder: string,
}