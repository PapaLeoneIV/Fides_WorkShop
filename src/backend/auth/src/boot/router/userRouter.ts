import express from 'express';
import cors from 'cors';
import { validate_and_return_user_info, HTTPhandle_registration_req, HTTPhandle_login_req, HTTPhandle_refresh_req } from '../../controller/handlers';

const app = express ();

const userRouter = express.Router();
const jwtRouter = express.Router();

app.use(cors()); 
app.use(express.json());

userRouter.post('/register', HTTPhandle_registration_req);   
userRouter.post('/login', HTTPhandle_login_req);

jwtRouter.post('/refresh', HTTPhandle_refresh_req);
jwtRouter.post('/validateJWT', validate_and_return_user_info);


app.use("/auth", jwtRouter);
app.use('/users', userRouter);

export default app;


