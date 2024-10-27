import bootService from "./boot";
import {rabbitSub} from "./models/index";

async function main() {

    await bootService();
    
    rabbitSub.consumeBikeOrder();
    rabbitSub.consumecancelBikeOrder();
}

main();


