"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UsuarioSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Types.ObjectId,
        required: false
    },
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    tipoDiscapacidad: {
        type: String,
        enum: ['Física', 'Sensorial', 'Psíquica', 'Ninguna'],
        required: true
    },
    saved: {
        type: [String]
    }
});
const UsuarioModel = (0, mongoose_1.model)('usuarios', UsuarioSchema);
exports.default = UsuarioModel;
