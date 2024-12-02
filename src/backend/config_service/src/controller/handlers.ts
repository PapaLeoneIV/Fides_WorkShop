import logger from "../config/logger";
import log from "../config/logs";
import { Request, Response } from "express";
import { configManager } from "../models";

export async function handleBikeKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getBikeBindingKeys();
    logger.info(log.SERVICE.PROCESSING(`Bike binding keys requested`, { }, keys));
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handleHotelKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getHotelBindingKeys();
    logger.info(log.SERVICE.PROCESSING(`Hotel binding keys requested`, { }, keys));
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handlePaymentKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getPaymentBindingKeys();
    logger.info(log.SERVICE.PROCESSING(`Payment binding keys requested`, { }, keys));

    res.status(200).send(keys);
    } catch (error) {
        res.status(500).send;
  }
}

export async function handleOrderKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getOrderManagerBindingKeys();
    logger.info(log.SERVICE.PROCESSING(`Order manager binding keys requested`, { }, keys));
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handleAuthKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getAuthBindingKeys();
    logger.info(log.SERVICE.PROCESSING(`Auth binding keys requested`, { }, keys));
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}
