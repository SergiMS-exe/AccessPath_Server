"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const valoracionModel_1 = require("./valoracionModel");
const CommentSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
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
const LocationSchema = new mongoose_1.Schema({
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
function coordinateArrayLimit(val) {
    return val.length === 2;
}
//LocationSchema.index({ type: '2dsphere' });
const AveragesSchema = new mongoose_1.Schema({
    fisica: {
        valoracion: valoracionModel_1.FisicaSchema,
        average: Number
    },
    sensorial: {
        valoracion: valoracionModel_1.SensorialSchema,
        average: Number
    },
    psiquica: {
        valoracion: valoracionModel_1.PsiquicaSchema,
        average: Number
    }
}, { _id: false });
const PhotoSchema = new mongoose_1.Schema({
    usuarioId: { type: String, required: true },
    base64: { type: String, required: true },
    alternativeText: { type: String, required: false },
});
const SitioSchema = new mongoose_1.Schema({
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
});
SitioSchema.index({ 'location': '2dsphere' });
const SitioModel = (0, mongoose_1.model)("sitios", SitioSchema);
exports.default = SitioModel;
