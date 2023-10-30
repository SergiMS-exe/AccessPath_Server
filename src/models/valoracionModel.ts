import { Schema, model } from 'mongoose';
import { FisicaEnum, SensorialEnum, PsiquicaEnum } from '../interfaces/Valoracion';

const generateSchemaFromEnum = (enumObj: any) => {
    const schemaObj: any = {};
    for (const key in enumObj) {
        schemaObj[enumObj[key]] = { type: Number, required: false };
    }
    return new Schema(schemaObj, { _id: false });
};

export const FisicaSchema = generateSchemaFromEnum(FisicaEnum);
export const SensorialSchema = generateSchemaFromEnum(SensorialEnum);
export const PsiquicaSchema = generateSchemaFromEnum(PsiquicaEnum);

const ValoracionIndividualSchema = new Schema({
    placeId: { type: String, required: true },
    userId: { type: String, required: true },
    fisica: { type: FisicaSchema, required: false },
    sensorial: { type: SensorialSchema, required: false },
    psiquica: { type: PsiquicaSchema, required: false }
});

// Modelo para las valoraciones
const ValoracionModel = model("valoraciones", ValoracionIndividualSchema);
export default ValoracionModel;