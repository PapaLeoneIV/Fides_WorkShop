import import logger from '../config/logger';
import log from '../config/logs';
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IServiceResponseDTO from "../dtos/IServiceResponseDTO";
import ServiceResponseSchema from "../schema/ServiceResponseSchema";
import { processBikeResponse, processHotelResponse, processPaymentResponse } from "../service/response-service";

export async function validateAndHandleBikeResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(message.CONTROLLER.VALIDATING("Bike Response validated successfully", "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.VALIDATING("Bike Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processBikeResponse(request);
        logger.info(message.CONTROLLER.PROCESSING(`Bike Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.PROCESSING("Bike Response failed", "", { error }));
        return error;
    }
}

export async function validateAndHandleHotelResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(message.CONTROLLER.VALIDATING("Hotel Response validated successfully", "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.VALIDATING("Hotel Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processHotelResponse(request);
        logger.info(message.CONTROLLER.PROCESSING(`Hotel Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.PROCESSING("Hotel Response failed", "", { error }));
        return error;
    }
}

export async function validateAndHandlePaymentResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(message.CONTROLLER.VALIDATING("Hotel Response validated successfully", "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.VALIDATING("Hotel Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processPaymentResponse(request);
        logger.info(message.CONTROLLER.PROCESSING(`Hotel Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        logger.error(message.CONTROLLER.PROCESSING("Hotel Response failed", "", { error }));
        return error;
    }
}