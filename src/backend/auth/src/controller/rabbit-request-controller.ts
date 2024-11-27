import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
import { RequestStatus as status } from "../config/RequestStatus";
import FrontendRegistrationSchema from "../schema/FrontendRegistrationSchema";
import FrontendLoginSchema from "../schema/FrontendLoginSchema";
import IRegistrationRequestDTO from "../dtos/IRegistrationRequestDTO";
import ILoginRequestDTO from "../dtos/IRegistrationRequestDTO";
import IAuthResponseDTO from "../dtos/IAuthResponseDTO";
import { publisher } from "../models/RabbitmqPublisher";
import { processRegistrationRequest, processLoginRequest, updateExchange } from "../service/rabbit-request-service";

export async function vaidateAndHandleRegistrationRequest(msg: string) {
  let REGISTRATION_BKEY = publisher.bindKeys.PublishRegistrationReq;
  let request: IRegistrationRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  try {
    request = FrontendRegistrationSchema.parse(JSON.parse(msg));
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    //TODO: understand why rick told me that is not necessary for this method to be waited
    await updateExchange(response, REGISTRATION_BKEY);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processRegistrationRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed`, "", error));
    throw error;
  }
}

export async function validateAndHandleLoginRequest(msg: string) {
  let LOGIN_BKEY = publisher.bindKeys.PublishLoginResp;
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  try {
    request = FrontendLoginSchema.parse(JSON.parse(msg));
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    await updateExchange(response, LOGIN_BKEY) /** before was updating via registration key */;
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processLoginRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed`, "", error));
    throw error;
  }
}
