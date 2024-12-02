import logger from '../config/logger';
import log from '../config/logs';
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IServiceResponseDTO from "../dtos/IServiceResponseDTO";
import ServiceResponseSchema from "../schema/ServiceResponseSchema";
import { processBikeResponse, processHotelResponse, processPaymentResponse } from "../service/response-service";

export async function validateAndHandleBikeResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(log.CONTROLLER.VALIDATING("Bike Response validated successfully",{ request }));
    } catch (error) {
        logger.error(log.CONTROLLER.VALIDATING("Bike Response",{ error }));
        return;
    }

    try {
        await processBikeResponse(request);
    } catch (error) {
        logger.error(log.CONTROLLER.PROCESSING("Bike Response failed",{ error }));
    }
}

export async function validateAndHandleHotelResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(log.CONTROLLER.VALIDATING("Hotel Response validated successfully",{ request }));
    } catch (error) {
        logger.error(log.CONTROLLER.VALIDATING("Hotel Response",{ error }));
        return;
    }

    try {
        await processHotelResponse(request);
    } catch (error) {
        logger.error(log.CONTROLLER.PROCESSING("Hotel Response failed",{ error }));
    }
}

export async function validateAndHandlePaymentResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        logger.info(log.CONTROLLER.VALIDATING("Payment Response validated successfully",{ request }));
    } catch (error) {
        logger.error(log.CONTROLLER.VALIDATING("Payment Response",{ error }));
        return;
    }

    try {
        await processPaymentResponse(request);
        logger.info(log.CONTROLLER.PROCESSING(`Payment Response processed successfully with order id ${request.order_id}`,{ request }));
    } catch (error) {
        logger.error(log.CONTROLLER.PROCESSING("Payment Response failed",{ error }));
    }
}