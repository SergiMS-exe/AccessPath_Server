type Person = {
    _id?: string;
    nombre: string;
    apellidos: string;
    email: string;
    password?: string;
    tipoDiscapacidad: string;
    saved?: string[];
};

export default Person