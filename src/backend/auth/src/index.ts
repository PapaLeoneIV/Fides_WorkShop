import logger from './config/logger';
import log from './config/logs';
import bootService from './boot/bootService';
import { EXCHANGE, QueueNames as queue } from './config/rabbit-config';
import { vaidateAndHandleRegistrationRequest, validateAndHandleLoginRequest } from './controller/rabbit-request-controller';
import { subscriber } from './models/RabbitmqSubscriber';
import app from './boot/initialize-express';

async function main(){

    await bootService();

    await subscriber.consume(queue.LOGIN_QUEUE_REQUEST, EXCHANGE, subscriber.bindKeys.ConsumeLoginReq, (msg) => validateAndHandleLoginRequest(msg));
    await subscriber.consume(queue.REGISTRATION_QUEUE_REQUEST, EXCHANGE, subscriber.bindKeys.ConsumeRegistrationReq, (msg) => vaidateAndHandleRegistrationRequest(msg));

    app.listen(3000, () => {
        logger.info(log.BOOT.BOOTING(`Server is running on port 3000`, {}));
    });
    // await rabbitSub.consumeUserInformationRequest();

}

main();