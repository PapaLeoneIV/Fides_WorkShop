
interface BikeBindingKey {

    ConsumeBikeOrder: string;
    ConsumeBikeSAGAOrder: string;
    PublishBikeOrder: string;
    PublishbikeSAGAOrder: string;
}

export const Bikeconfig: BikeBindingKey = {
    ConsumeBikeOrder: "BDbike_request",
    ConsumeBikeSAGAOrder: "BDbike_SAGA_request",
    PublishBikeOrder: "bike_main_listener",
    PublishbikeSAGAOrder: "bike_saga_listener"
};