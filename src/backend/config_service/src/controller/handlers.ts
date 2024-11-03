import { Request, Response } from 'express';
import { configManager } from '../models';

export async function handleBikeKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getBikeBindingKeys();
        console.log("[CONFIG SERVICE] Bike binding keys requested");
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handleHotelKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getHotelBindingKeys();
        console.log("[CONFIG SERVICE] Hotel binding keys requested");
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handlePaymentKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getPaymentBindingKeys();
        console.log("[CONFIG SERVICE] Payment binding keys requested"); 

        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handleOrderKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getOrderManagerBindingKeys();
        console.log("[CONFIG SERVICE] Order manager binding keys requested"); 
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}

export async function handleAuthKeys(req: Request, res: Response) {
    try {
        const keys = configManager.getAuthBindingKeys();
        console.log("[CONFIG SERVICE] Auth binding keys requested"); 
        res.status(200).send(keys);
    } catch (error) {
        res.status(500).send
    }

}