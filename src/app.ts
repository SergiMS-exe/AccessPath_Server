import "dotenv/config"
import express from "express"
import cors from "cors"
import { router } from "./routes/index";
import dbConnect from "./config/mongo";
import { handle404Error } from "./utils/error.handle";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
//app.use(handle404Error);

dbConnect().then(()=>console.log("Conexion a base de datos establecida")).
    catch((e)=>console.error("Error en la conexion a base de datos: "+e))

app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`));

export default app;