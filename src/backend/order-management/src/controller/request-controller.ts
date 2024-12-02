import logger from '../config/logger';
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
export async function HTTPValidateAndHandleFrontendRequest(req: Request, res: Response) :Promise<void>{
  let response: IToFrontendResponseDTO = { order_status: status.ERROR, message: "Invalid data format", token: null };
  let request: IFrontendRequestDTO;

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    request = FrontendRequestSchema.parse(req.body);
    logger.info(log.CONTROLLER.VALIDATING("Frontend Request validated successfully",{ request }));    
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING("Frontend Request",error));
    res.status(400).send(response);
    return 
  }

  try {
    await HTTPprocessFrontendRequest(request, res);
    logger.info(log.CONTROLLER.PROCESSING(`Frontend Request processed successfully`,{ request }));

  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING("Frontend Request failed",error));
    // res.status(500).send(response);
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
export async function HTTPValidateAndHandleConfirmationRequest(req: Request, res: Response) : Promise<void> {
  let response: IToFrontendResponseDTO = { order_status: status.ERROR, message: "Invalid data format", token: null };
  let order_id: string;
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    //TODO: understand what req.query is and how to parse it
    order_id = req.query.order_id as string; //TODO: check how to make it standardize with the other controller where the request is parsed from req.body
    if (!order_id) throw new Error("Order ID not found in request");

    logger.info(log.CONTROLLER.VALIDATING(`Confirmation request validated successfully`,{ order_id }));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating confirmation request: ${error}`, {  }, req));
    res.status(400).send(response);
    return
  }

  try {
    await HTTPprocessConfirmationRequest(order_id, res);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Confirmation request failed: ${error}`, {  }, req));
    res.status(500).send(response);
  }
}

/**
 * Validates and handles the frontend request
 * @param msg - The log received from the frontend
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
    logger.info(log.CONTROLLER.VALIDATING("Frontend Request validated successfully",{ request }));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating frontend request: ${error}`, {  }));
    return;
  }

  try {
    await processFrontendRequest(request, userJWT);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Frontend Request failed: ${error}`, {  }));
  }
}
