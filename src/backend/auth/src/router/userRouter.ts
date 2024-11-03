import express from 'express';
import { validate_and_return_user_info  } from '../controller/handlers';
import { Request, Response } from 'express';

const app = express ();

const router = express.Router();

router.get('/validateJWT', validate_and_return_user_info);

app.use('/users', router);

export default app;


