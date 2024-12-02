import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
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
    logger.info(log.CONTROLLER.VALIDATING(`Registration request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating registration request: ${error}`, { error }));
    return await updateExchange(response, REGISTRATION_BKEY);
  }

  try {
    processRegistrationRequest(request);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Registration request failed: ${error}`, { error }));
  }
}

export async function validateAndHandleLoginRequest(msg: string) {
  let LOGIN_BKEY = publisher.bindKeys.PublishLoginResp;
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  try {
    request = FrontendLoginSchema.parse(JSON.parse(msg));
    logger.info(log.CONTROLLER.VALIDATING(`Login request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating login request: ${error}`, { error }));
    return await updateExchange(response, LOGIN_BKEY) /** before was updating via registration key */;
  }

  try {
    processLoginRequest(request);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Login request failed: ${error}`, { error }));
  }
}
