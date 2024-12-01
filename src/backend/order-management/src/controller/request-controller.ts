import import logger from './config/logger';
import log from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IFrontendRequestDTO from "../dtos/IFrontendRequestDTO";
import FrontendRequestSchema from "../schema/FrontendRequestSchema";
import { Request, Response } from "express";
import IToFrontendResponseDTO from "../dtos/IToFrontendResponseDTO";
import { RequestStatus as status } from "../config/RequestStatus";
import {
  processFrontendRequest,
  HTTPprocessConfirmationRequest,
  HTTPprocessFrontendRequest,
} from "../service/request-service";

/**
 * Validates and handles the frontend request
 * @param req - The request received from the frontend
 * @param res - The response to be sent to the frontend
 * @returns - The response to be sent to the frontend
 * @throws - If the request is invalid
 * @throws - If the request processing fails
 */
export async function HTTPValidateAndHandleFrontendRequest(req: Request, res: Response) {
  let response: IToFrontendResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };
  let request: IFrontendRequestDTO;

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendRequestSchema.parse(req.body);
    console.log(message.CONTROLLER.INFO.VALIDATING("Frontend Request validated successfully", "", { request }));
  } catch (error) {
    console.error(message.CONTROLLER.WARNING.VALIDATING("Frontend Request", "", error));
    res.status(400).send(response);
    throw error;
  }

  try {
    await HTTPprocessFrontendRequest(request, res);
    console.log(message.CONTROLLER.INFO.PROCESSING(`Frontend Request processed successfully`, "", { request }));
  } catch (error) {
    console.error(message.CONTROLLER.ERROR.PROCESSING("Frontend Request failed", "", error));
    // res.status(500).send(response);
    throw error;
  }
}

/**
 * Validates and handles the confirmation request
 * @param req - The request received from the frontend
 * @param res - The response to be sent to the frontend
 * @returns - The response to be sent to the frontend
 * @throws - If the request is invalid
 * @throws - If the request processing fails
 */
export async function HTTPValidateAndHandleConfirmationRequest(req: Request, res: Response) {
  let response: IToFrontendResponseDTO = { status: status.ERROR, message: "Invalid data format", token: null };
  let order_id: string;
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    //TODO: understand what req.query is and how to parse it
    order_id = req.query.order_id as string; //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    if (!order_id) throw new Error("Order ID not found in request");

    console.log(message.CONTROLLER.INFO.VALIDATING(`Confirmation request validated successfully`, "", { order_id }));
  } catch (error) {
    console.error(message.CONTROLLER.WARNING.VALIDATING(`Error validating confirmation request`, "", error));
    res.status(400).send(response);
    throw error;
  }

  try {
    await HTTPprocessConfirmationRequest(order_id, res);
    console.log(message.CONTROLLER.INFO.PROCESSING(`Confirmation request processed successfully`, "", req.query));
  } catch (error) {
    console.error(message.CONTROLLER.ERROR.PROCESSING(`Confirmation request failed`, "", error));
    res.status(500).send(response);
    throw error;
  }
}

/**
 * Validates and handles the frontend request
 * @param msg - The message received from the frontend
 */
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
