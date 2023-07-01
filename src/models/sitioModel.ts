import { Schema, Types, model } from "mongoose";
import Site from "../interfaces/Site";

const SitioSchema = new Schema<Site>(
    {
        placeId: {
            type: String,
            required: true,
        },
        nombre: {
            type: String,
            required: true,
        },
        direccion: {
            type: String,
            required: true,
        },
        calificacionGoogle: {
            type: Number,
            required: true,
        },
        location: {
            type: {
                latitude: Number,
                longitude: Number
            },
            required: true,
        },
        types: {
            type: [String],
            required: true,
        },
    }
);

const SitioModel = model("sitios", SitioSchema);
export default SitioModel;