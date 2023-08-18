import { ObjectId } from 'mongodb';
type Person = {
    _id?: ObjectId;
    nombre: string;
    apellidos: string;
    email: string;
    password?: string;
    tipoDiscapacidad: string;
    saved?: string[];
};

export default Person