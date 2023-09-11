"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
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
    const doc = this;
    // Si ambos, usuarioId y usuario, están presentes o ausentes, detiene la operación
    if ((doc.usuarioId && doc.usuario) || (!doc.usuarioId && !doc.usuario)) {
        next(new Error('Debe tener usuarioId o usuario, pero no ambos.'));
    }
    else {
        next();
    }
});
const LocationSchema = new mongoose_1.Schema({
    latitude: Number,
    longitude: Number
});
const ValoracionesSchema = new mongoose_1.Schema({
    fisica: {
        average: Number,
        entrada: Number,
        taza_bano: Number,
        rampas: Number,
        ascensores: Number,
        pasillos: Number,
        banos_adaptados: Number,
        senaletica_clara: Number
    },
    sensorial: {
        average: Number,
        senaletica_braille: Number,
        sistemas_amplificacion: Number,
        iluminacion_adecuada: Number,
        informacion_accesible: Number,
        pictogramas_claros: Number
    },
    psiquico: {
        average: Number,
        informacion_simple: Number,
        senaletica_intuitiva: Number,
        espacios_tranquilos: Number,
        interaccion_personal: Number
    }
});
const SitioSchema = new mongoose_1.Schema({
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
        type: ValoracionesSchema,
        required: false
    }
});
const SitioModel = (0, mongoose_1.model)("sitios", SitioSchema);
exports.default = SitioModel;
