import express, { Router } from "express";
import { getUsers_handler, getUserById_handler, insertUser_handler, deleteUserById_handler, getUserMoney_handler} from "../service/userService.js";

export const app = express();

const UserRouter = Router();

UserRouter.get("/getUsers", getUsers_handler);
UserRouter.get("/getUser/:id", getUserById_handler);
UserRouter.put("/insertUser/:id", insertUser_handler);
UserRouter.delete("/deleteUser/:id", deleteUserById_handler);
UserRouter.get("/getUserMoney/:id", getUserMoney_handler);

export { UserRouter };