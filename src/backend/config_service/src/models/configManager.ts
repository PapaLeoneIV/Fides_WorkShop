import {Bikeconfig} from '../dtos/IBikeBindingKeysDTO';
import {Hotelconfig} from '../dtos/IHotelBindingKeysDTO';
import {Paymentconfig} from '../dtos/PaymentBindingKeys.dto';
import {Orderconfig} from '../dtos/IOrderManagerBindingKeysDTO';
import {Authconfig} from '../dtos/IAuthBindingKeysDTO';


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