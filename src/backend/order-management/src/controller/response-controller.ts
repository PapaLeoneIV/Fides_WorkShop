import import logger from './config/logger';
import log from '../config/logs';
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IServiceResponseDTO from "../dtos/IServiceResponseDTO";
import ServiceResponseSchema from "../schema/ServiceResponseSchema";
import { processBikeResponse, processHotelResponse, processPaymentResponse } from "../service/response-service";

export async function validateAndHandleBikeResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        console.log(message.CONTROLLER.INFO.VALIDATING("Bike Response validated successfully", "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.VALIDATING("Bike Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processBikeResponse(request);
        console.log(message.CONTROLLER.INFO.PROCESSING(`Bike Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.PROCESSING("Bike Response failed", "", { error }));
        return error;
    }
}

export async function validateAndHandleHotelResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        console.log(message.CONTROLLER.INFO.VALIDATING("Hotel Response validated successfully", "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.VALIDATING("Hotel Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processHotelResponse(request);
        console.log(message.CONTROLLER.INFO.PROCESSING(`Hotel Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.PROCESSING("Hotel Response failed", "", { error }));
        return error;
    }
}

export async function validateAndHandlePaymentResponse(msg: string) {
    let request: IServiceResponseDTO;

    try {
        request = ServiceResponseSchema.parse(JSON.parse(msg));
        console.log(message.CONTROLLER.INFO.VALIDATING("Hotel Response validated successfully", "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.VALIDATING("Hotel Response", "", { error }));
        return new Error(HTTPerror.BAD_REQUEST.message);
    }

    try {
        await processPaymentResponse(request);
        console.log(message.CONTROLLER.INFO.PROCESSING(`Hotel Response processed successfully with order id ${request.order_id}`, "", { request }));
    } catch (error) {
        console.error(message.CONTROLLER.ERROR.PROCESSING("Hotel Response failed", "", { error }));
        return error;
    }
}