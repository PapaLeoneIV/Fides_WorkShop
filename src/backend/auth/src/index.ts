import { bootService } from './boot/index';
import { rabbitSub } from './models/index';

async function main(){

    await bootService();

    await rabbitSub.consumeLoginRequest();
    await rabbitSub.consumeRegistrationRequest();

}



main();