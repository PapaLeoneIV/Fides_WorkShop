
interface BikeBindingKey {

    ConsumebikeOrder: string;
    ConsumebikeSAGAOrder: string;
    PublishbikeOrder: string;
    PublishbikeSAGAOrder: string;
}

export const Bikeconfig: BikeBindingKey = {
    ConsumebikeOrder: "BDbike_request",
    ConsumebikeSAGAOrder: "BDbike_SAGA_request",
    PublishbikeOrder: "bike_main_listener",
    PublishbikeSAGAOrder: "bike_saga_listener"
};