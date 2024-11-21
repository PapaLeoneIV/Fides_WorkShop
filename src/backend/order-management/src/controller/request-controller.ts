import { Messages as message } from '../config/Messages';
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IFrontendRequestDTO from "../dtos/IFrontendRequestDTO";
import FrontendRequestSchema from "../schema/FrontendRequestSchema";
import { processFrontendRequest } from "../service/request-service";

export async function validateAndHandleFrontendRequest(msg: string) {
    let request: IFrontendRequestDTO;
    let userJWT: string;

    try {
        const rawData = JSON.parse(msg);

        if (!(userJWT = rawData.userJWT)) {
            throw new Error("User JWT not found in request");
        }
        delete rawData.userJWT;
        request = FrontendRequestSchema.parse(rawData);
        console.log(message.CONTROLLER.INFO.VALIDATING("Frontend Request validated successfully", "", { request }));
    } catch (error) {
        console.log(message.CONTROLLER.ERROR.VALIDATING("Frontend Request", "", { error }));
        throw new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processFrontendRequest(request, userJWT);
        console.log(message.CONTROLLER.INFO.PROCESSING(`Frontend Request processed successfully`, "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.PROCESSING("Frontend Request failed", "", { error }));
        throw error;
    }
}
