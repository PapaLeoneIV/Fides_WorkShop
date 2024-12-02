import logger from '../config/logger';
import log  from "../config/logs";
import { Request, Response } from "express";
import { RequestStatus as status } from "../config/RequestStatus";
import IRegistrationRequestDTO from "../dtos/IRegistrationRequestDTO";
import ILoginRequestDTO from "../dtos/IRegistrationRequestDTO";
import IAuthResponseDTO from "../dtos/IAuthResponseDTO";
import IOrderInfoDTO from "../dtos/IOrderInfoDTO";
import FrontendRegistrationSchema from "../schema/FrontendLoginSchema";
import FrontendLoginSchema from "../schema/FrontendLoginSchema";
import FrontendLoginReqchema from "../schema/FrontendReqSchema";
import {
  HTTPprocessRegistrationRequest,
  HTTPprocessLoginRequest,
  HTTPprocessJwtRefreshRequest,
  HTTPprocessUserInformationRequest,
} from "../service/HTTP-request-service";

export async function HTTPvalidateRegistrationRequest(req: Request, res: Response) {
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };
  let request: IRegistrationRequestDTO;

  // To allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendRegistrationSchema.parse(req.body);
    logger.info(log.CONTROLLER.VALIDATING(`Registration request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating registration request: ${error}`, { error }, req));
    return res.status(500).json(response);
  }

  try {
    HTTPprocessRegistrationRequest(request, res);
  } catch (error) {
    logger.warning(log.CONTROLLER.PROCESSING(`Registration request failed: ${error}`, { error }, request));
    // res.status(500).json(response);
  }
}

export async function HTTPvalidateLoginRequest(req: Request, res: Response) {
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  // To allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    
    request = FrontendLoginSchema.parse(req.body.msg); //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    logger.info(log.CONTROLLER.VALIDATING(`Login request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating login request: ${error}`, { error }, req));
    return res.status(500).json(response);
  }

  try {
    HTTPprocessLoginRequest(request, res);
  } catch (error) {
    logger.warning(log.CONTROLLER.PROCESSING(`Login request failed: ${error}`, { error }, request));
    // res.status(500).json(response);
  }
}

export async function HTTPvalidateAndHandleJwtRefreshRequest(req: Request, res: Response) {
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  // To allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendLoginSchema.parse(req.body.msg); //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    logger.info(log.CONTROLLER.VALIDATING(`JWT Refresh request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating JWT refresh request: ${error}`, { error }, req));
    return res.status(500).json(response);
  }

  try {
    HTTPprocessJwtRefreshRequest(request, res);
  } catch (error) {
    logger.warning(log.CONTROLLER.PROCESSING(`JWT Refresh request failed: ${error}`, { error }, request));
    // res.status(500).json(response);
  }
}

export async function HTTPvalidateAndHandleUserInformation(req: Request, res: Response) {
  // let info: { email: string; token: string } = { email:token: "" };
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };
  let request: IOrderInfoDTO;

  try {
    request = FrontendLoginReqchema.parse(req.body);
    logger.info(log.CONTROLLER.VALIDATING(`User info validation request validated successfully`, { }, request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating user info validation request: ${error}`, { error }, req));
    return res.status(500).json(response);
  }

  try {
    HTTPprocessUserInformationRequest(request, res)
  } catch (error) {
    logger.warning(log.CONTROLLER.PROCESSING(`User info validation request failed: ${error}`, { error }, request));
    // res.status(500).json(response);
  }
}
