import { Messages as log } from "../config/Messages";
import { Request, Response } from "express";
import { RequestStatus as status } from "../config/RequestStatus";
import IRegistrationRequestDTO from "../dtos/IRegistrationRequestDTO";
import ILoginRequestDTO from "../dtos/IRegistrationRequestDTO";
import IAuthResponseDTO from "../dtos/IAuthResponseDTO";
import FrontendRegistrationSchema from "../schema/FrontendLoginSchema";
import FrontendLoginSchema from "../schema/FrontendLoginSchema";
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
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    res.status(500).json(response);
    throw error;
  }

  try {
    HTTPprocessRegistrationRequest(request, res);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed ${error}`, "", error));
    // res.status(500).json(response);
    throw error;
  }
}

export async function HTTPvalidateLoginRequest(req: Request, res: Response) {
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  // To allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendLoginSchema.parse(req.body.msg); //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    res.status(500).json(response);
    throw error;
  }

  try {
    HTTPprocessLoginRequest(request, res);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed ${error}`, "", error));
    // res.status(500).json(response);
    throw error;
  }
}

export async function HTTPvalidateAndHandleJwtRefreshRequest(req: Request, res: Response) {
  let request: ILoginRequestDTO;
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };

  // To allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendLoginSchema.parse(req.body.msg); //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    res.status(500).json(response);
    throw error;
  }

  try {
    HTTPprocessJwtRefreshRequest(request, res);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed ${error}`, "", error));
    // res.status(500).json(response);
    throw error;
  }
}

export async function HTTPvalidateAndHandleUserInformation(req: Request, res: Response) {
  // let info: { email: string; token: string } = { email: "", token: "" };
  let response: IAuthResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };
  let request: ILoginRequestDTO;

  try {
    request = FrontendLoginSchema.parse(req.body);
    console.log(log.CONTROLLER.INFO.VALIDATING(`Authorization request validated successfully`, "", request));
  } catch (error) {
    console.log(log.CONTROLLER.WARNING.VALIDATING(`Error validating authorization request`, "", error));
    res.status(500).json(response);
    throw error;
  }

  try {
    HTTPprocessUserInformationRequest(request, res);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Authorization request for ${request.email} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed ${error}`, "", error));
    // res.status(500).json(response);
    throw error;
  }
}
