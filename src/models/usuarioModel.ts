import { Schema, Types, model, Model } from "mongoose";
import Person  from "../interfaces/Person";

const UsuarioSchema = new Schema<Person>(
    {
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
    }
);

const UsuarioModel = model('usuarios', UsuarioSchema);
export default UsuarioModel;