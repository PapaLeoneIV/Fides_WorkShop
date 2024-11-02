import bootService from './boot';
import {rabbitSub } from './models/index';


async function main() {
 
    await bootService();

    rabbitSub.ConsumeHotelOrder()
    rabbitSub.consumecancelHotelOrder()
}

main();

