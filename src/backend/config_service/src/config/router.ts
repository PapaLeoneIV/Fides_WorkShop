import express from 'express';
import { handleBikeKeys, handleHotelKeys, handlePaymentKeys, handleOrderKeys, handleAuthKeys } from '../controller/handlers';

const app = express ();

const router = express.Router();

router.get('/bikeKeys', handleBikeKeys);

router.get('/hotelKeys', handleHotelKeys);

router.get('/paymentKeys', handlePaymentKeys)

router.get('/orderKeys', handleOrderKeys);

router.get('/authKeys', handleAuthKeys);

app.use('/config', router);

export default app;


