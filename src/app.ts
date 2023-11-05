import "dotenv/config"
import express from "express"
import cors from "cors"
import { router } from "./routes/index";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
//app.use(handle404Error);

export default app;