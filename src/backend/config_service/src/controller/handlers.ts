import { Request, Response } from "express";
import { configManager } from "../models";

export async function handleBikeKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getBikeBindingKeys();
    logger.info("[CONFIG SERVICE] Bike binding keys requested");
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handleHotelKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getHotelBindingKeys();
    logger.info("[CONFIG SERVICE] Hotel binding keys requested");
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handlePaymentKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getPaymentBindingKeys();
    logger.info("[CONFIG SERVICE] Payment binding keys requested");

    res.status(200).send(keys);
    } catch (error) {
        res.status(500).send;
  }
}

export async function handleOrderKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getOrderManagerBindingKeys();
    logger.info("[CONFIG SERVICE] Order manager binding keys requested");
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}

export async function handleAuthKeys(req: Request, res: Response) {
  try {
    const keys = configManager.getAuthBindingKeys();
    logger.info("[CONFIG SERVICE] Auth binding keys requested");
    res.status(200).send(keys);
  } catch (error) {
    res.status(500).send;
  }
}
