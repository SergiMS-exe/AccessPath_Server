import { Schema, model } from "mongoose";
import CommentType from "../interfaces/CommentType";
import { Site } from "../interfaces/Site";
import { FisicaSchema, PsiquicaSchema, SensorialSchema } from "./valoracionModel";
import { transformToServerFormat } from '../utils/auxiliar.handle';

const CommentSchema = new Schema<CommentType>({
    _id: { type: Schema.Types.ObjectId, required: true },
    usuarioId: { type: String },
    // usuario: {
    //     _id: { type: String },
    //     nombre: String,
    //     apellidos: String,
    // },
    texto: { type: String, required: true },
    date: { type: Date, required: true },
});

// CommentSchema.pre('save', function (next) {
//     // Aserción de tipo para this
//     const doc = this;

//     // Si ambos, usuarioId y usuario, están presentes o ausentes, detiene la operación
//     if ((doc.usuarioId && doc.usuario) || (!doc.usuarioId && !doc.usuario)) {
//         next(new Error('Debe tener usuarioId o usuario, pero no ambos.'));
//     } else {
//         next();
//     }
// });

const LocationSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [{ type: Number }],
        required: true,
        validate: [coordinateArrayLimit, '{PATH} exceeds the limit of 2']
    }
});

function coordinateArrayLimit(val: any) {
    return val.length === 2;
}

//LocationSchema.index({ type: '2dsphere' });

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

const PhotoSchema = new Schema({
    usuarioId: { type: String, required: true },
    base64: { type: String, required: true },
    alternativeText: { type: String, required: false },
});

const SitioSchema = new Schema<Site>(
    {
        placeId: { type: String, required: true },
        nombre: { type: String, required: true },
        direccion: { type: String, required: true },
        calificacionGoogle: { type: Number, required: true },
        link: { type: String, required: false },
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
        },
        fotos: {
            type: [PhotoSchema],
            required: false
        }
    }
);

SitioSchema.index({ 'location': '2dsphere' });

const SitioModel = model("sitios", SitioSchema);
export default SitioModel;
