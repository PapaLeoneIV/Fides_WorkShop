import BikeOrderDTO from "../dtos/bikeOrder.dto"
import { parse_request } from "../parser/helper";
import { handleOrder } from "../services/bikeService";


export async fucntion handleOrderRequest( msg: string ) {
    let order_info: BikeOrderDTO;

    order_info = await parse_request(msg, bike_info_schema);


}