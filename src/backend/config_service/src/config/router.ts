import express from 'express';
import { handleBikeKeys, handleHotelKeys, handlePaymentKeys, handleOrderKeys } from '../controller/handlers';

const router = express.Router();

const app = express ();

router.get('/bikeKeys', handleBikeKeys);

router.get('/hotelKeys', handleHotelKeys);

router.get('/paymentKeys', handlePaymentKeys)

router.get('/orderKeys', handleOrderKeys);

app.use('/config', router);

export default app;


