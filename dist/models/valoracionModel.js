"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsiquicaSchema = exports.SensorialSchema = exports.FisicaSchema = void 0;
const mongoose_1 = require("mongoose");
const Valoracion_1 = require("../interfaces/Valoracion");
const generateSchemaFromEnum = (enumObj) => {
    const schemaObj = {};
    for (const key in enumObj) {
        schemaObj[enumObj[key]] = { type: Number, required: false };
    }
    return new mongoose_1.Schema(schemaObj, { _id: false });
};
exports.FisicaSchema = generateSchemaFromEnum(Valoracion_1.FisicaEnum);
exports.SensorialSchema = generateSchemaFromEnum(Valoracion_1.SensorialEnum);
exports.PsiquicaSchema = generateSchemaFromEnum(Valoracion_1.PsiquicaEnum);
const ValoracionIndividualSchema = new mongoose_1.Schema({
    placeId: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    fisica: { type: exports.FisicaSchema, required: false },
    sensorial: { type: exports.SensorialSchema, required: false },
    psiquica: { type: exports.PsiquicaSchema, required: false }
});
// Modelo para las valoraciones
const ValoracionModel = (0, mongoose_1.model)("valoraciones", ValoracionIndividualSchema);
exports.default = ValoracionModel;
