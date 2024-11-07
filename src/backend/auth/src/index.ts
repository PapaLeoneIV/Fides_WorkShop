import { bootService } from './boot/index';
import { rabbitSub } from './models/index';
import app from './boot/router/userRouter';

async function main(){

    await bootService();

    await rabbitSub.consumeLoginRequest();
    await rabbitSub.consumeRegistrationRequest();

    app.listen(3000, () => {
        console.log('[AUTH SERVICE] Service started on port 3000');
    });
    // await rabbitSub.consumeUserInformationRequest();

}



main();