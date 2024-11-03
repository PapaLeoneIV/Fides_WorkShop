import {Bikeconfig} from '../dtos/BikeBindingKeys.dto';
import {Hotelconfig} from '../dtos/HotelBindingKeys.dto';
import {Paymentconfig} from '../dtos/PaymentBindingKeys.dto';
import {Orderconfig} from '../dtos/OrderManagerBindingKeys.dto';
import {Authconfig} from '../dtos/AuthBindingKeys.dto';


export class ConfigManager {
    
    constructor() {
    }

    getBikeBindingKeys() {
        return Bikeconfig;
    }

    getHotelBindingKeys() {
        return Hotelconfig;
    }

    getPaymentBindingKeys() {
        return Paymentconfig;
    }

    getOrderManagerBindingKeys() {
        return Orderconfig;
    }

    getAuthBindingKeys() {
        return Authconfig;
    }
}