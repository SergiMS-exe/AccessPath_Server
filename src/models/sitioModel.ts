import { Schema, model } from "mongoose";
import CommentType from "../interfaces/CommentType";
import { Site } from "../interfaces/Site";
import { FisicaSchema, PsiquicaSchema, SensorialSchema } from "./valoracionModel";

const CommentSchema = new Schema<CommentType>({
    _id: { type: Schema.Types.ObjectId, required: true },
    usuarioId: { type: String },
    usuario: {
        _id: { type: String },
        nombre: String,
        apellidos: String,
    },
    texto: { type: String, required: true },
    date: { type: Date, required: true },
});

CommentSchema.pre('save', function (next) {
    // Aserción de tipo para this
    const doc = this as any;

    // Si ambos, usuarioId y usuario, están presentes o ausentes, detiene la operación
    if ((doc.usuarioId && doc.usuario) || (!doc.usuarioId && !doc.usuario)) {
        next(new Error('Debe tener usuarioId o usuario, pero no ambos.'));
    } else {
        next();
    }
});

const LocationSchema = new Schema({
    latitude: Number,
    longitude: Number
});

const AveragesSchema = new Schema({
    fisica: {
        valoracion: FisicaSchema,
        average: Number
    },
    sensorial: {
        valoracion: SensorialSchema,
        average: Number
    },
    psiquica: {
        valoracion: PsiquicaSchema,
        average: Number
    }
}, { _id: false });

const SitioSchema = new Schema<Site>(
    {
        placeId: { type: String, required: true },
        nombre: { type: String, required: true },
        direccion: { type: String, required: true },
        calificacionGoogle: { type: Number, required: true },
        location: {
            type: LocationSchema,
            required: true,
        },
        types: { type: [String], required: true },
        comentarios: {
            type: [CommentSchema],
            required: false
        },
        valoraciones: {
            type: AveragesSchema,
            required: false
        }
    }
);

const SitioModel = model("sitios", SitioSchema);
export default SitioModel;
