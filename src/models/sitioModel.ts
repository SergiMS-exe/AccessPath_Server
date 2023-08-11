import { Schema, Types, model } from "mongoose";
import Site from "../interfaces/Site";
import CommentType from "../interfaces/CommentType";
import { ObjectId } from "mongodb";

const ComentarioSchemaNoName = new Schema({
    _id: ObjectId,
    usuarioId: {
        type: String,
        required: true
    },
    texto: String,
});

const ComentarioSchemaWithName = new Schema({
    _id: ObjectId,
    usuario: {
        _id: {
            type: String,
            required: true
        },
        nombre: String,
        apellidos: String,
    },
    texto: String,
});

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
        comentarios: {
            type: [ComentarioSchemaNoName || ComentarioSchemaWithName],
            required: false
        }
    }
);

const SitioModel = model("sitios", SitioSchema);
export default SitioModel;