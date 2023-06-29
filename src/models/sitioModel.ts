import { Schema, Types, model } from "mongoose";
import Site from "../interfaces/Site";

const SiteSchema = new Schema<Site>(
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

const SiteModel = model("sitios", SiteSchema);
export default SiteModel;