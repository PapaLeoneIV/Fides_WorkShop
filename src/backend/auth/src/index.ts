import { bootService } from './boot/index';
import { rabbitSub } from './models/index';
import app from './boot/router/userRouter';

async function main(){
    const port = 3000;

    await bootService();

    await rabbitSub.consumeLoginRequest();
    await rabbitSub.consumeRegistrationRequest();

    app.listen(port, () => {
        console.log('[AUTH SERVICE] Service started on port ', port);
    });
    // await rabbitSub.consumeUserInformationRequest();

}



main();