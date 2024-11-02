import { Request, Response } from 'express';
import { configManager } from '../models';

export async function handleBikeKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getBikeBindingKeys();
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handleHotelKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getHotelBindingKeys();
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handlePaymentKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getPaymentBindingKeys();
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handleOrderKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getOrderManagerBindingKeys();
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}