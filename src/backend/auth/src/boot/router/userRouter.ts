import express from 'express';
import cors from 'cors';
import { validate_and_return_user_info, HTTPhandle_registration_req, HTTPhandle_login_req, HTTPhandle_refresh_req } from '../../controller/handlers';

const app = express ();

const router = express.Router();


router.post('/register', HTTPhandle_registration_req);   
router.post('/login', HTTPhandle_login_req);
router.post('/refresh', HTTPhandle_refresh_req);
router.post('/validateJWT', validate_and_return_user_info);
app.use(express.json());
app.use(cors()); 

app.use('/users', router);
app.use("/auth", router);

export default app;


