import express from 'express';
import { validate_and_return_user_info  } from '../controller/handlers';

const app = express ();

const router = express.Router();

router.post('/validateJWT', validate_and_return_user_info);
app.use(express.json());
app.use('/users', router);


export default app;


