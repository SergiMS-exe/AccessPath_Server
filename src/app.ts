import "dotenv/config"
import express from "express"
import cors from "cors"
import { router } from "./routes/index";
import dbConnect from "./config/mongo";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

dbConnect().then(()=>console.log("Conexion a base de datos establecida")).
    catch((e)=>console.error("Error en la conexion a base de datos: "+e))

app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`));