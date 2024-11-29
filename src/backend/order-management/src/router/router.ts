import express from "express";
import cors from "cors";
import { HTTPhandle_req_from_frontend, HTTPhandle_req_from_confirmation } from "../controllers/handlers";
let app = express();

let router = express.Router();

router.use(express.json())
router.use(cors())

router.post('/booking', HTTPhandle_req_from_frontend);
router.get("/confirmation", HTTPhandle_req_from_confirmation);

app.use('/order', router);

export default app;