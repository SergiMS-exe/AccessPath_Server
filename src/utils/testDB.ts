import mongoose, { Types } from 'mongoose';
import UsuarioModel from '../models/usuarioModel';
import SitioModel from '../models/sitioModel';
import ValoracionModel from '../models/valoracionModel';
import { hashUserPasswords } from './bcrypt.handle';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Person from '../interfaces/Person';
import { Valoracion } from '../interfaces/Valoracion';

export const initializeTestDb = async () => {
    // Conectar a la base de datos de pruebas
    const mongoMemoryServer = await MongoMemoryServer.create();
    const DB_URI = mongoMemoryServer.getUri();
    await mongoose.connect(DB_URI, { dbName: 'test' });
    await setUpDBData();
};

const clearTestDb = async () => {
    // Eliminar todos los datos de la base de datos de pruebas
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

export const setUpDBData = async () => {
    // Insertar datos iniciales en la base de datos de pruebas
    await clearTestDb();
    await seedSitios();
    await seedUsuarios();
    await seedValoraciones();
};

export const closeTestDb = async () => {
    // Cerrar la conexión con la base de datos de pruebas
    //await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};

export let usuarios: Person[] = [
    {
        nombre: "Alice",
        apellidos: "Smith",
        email: "alice@example.com",
        password: "Password_1",
        tipoDiscapacidad: "Ninguna",
        saved: ["123", "456"] // IDs de ejemplo de elementos guardados
    },
    {
        nombre: "Bob",
        apellidos: "Jones",
        email: "bob@example.com",
        password: "Password_2",
        tipoDiscapacidad: "Física",
        saved: []
    },
];

export const sitios = [
    {
        placeId: "place1",
        nombre: "Café Central",
        direccion: "Calle Falsa 123",
        calificacionGoogle: 4.2,
        location: {
            type: "Point",
            coordinates: [-99.133208, 19.4326077]
        },
        types: ["cafe", "bakery"],
        comentarios: [
            {
                _id: new mongoose.Types.ObjectId(),
                usuarioId: "user1",
                texto: "Great place to have a coffee!",
                date: new Date()
            }
        ],
        valoraciones: {
            fisica: {
                valoracion: {
                    entrada: 4,
                    rampas: 5
                },
                average: 4.5
            },
            sensorial: {
                valoracion: {
                    senaletica_braille: 4,
                    pictogramas_claros: 2
                },
                average: 3
            },
            psiquica: {
                valoracion: {
                    espacios_tranquilos: 5,
                    informacion_simple: 3
                },
                average: 4
            }
        },
        fotos: [
            {
                usuarioId: "user1",
                base64: "base64_encoded_image_string",
                alternativeText: "A cozy corner in the café"
            }
        ]
    },
    {
        placeId: "place2",
        nombre: "Librería Readmore",
        direccion: "Avenida Siempreviva 742",
        calificacionGoogle: 4.8,
        location: {
            type: "Point",
            coordinates: [-99.135208, 19.4327087]
        },
        types: ["library", "store"],
        comentarios: [],
        valoraciones: {},
        fotos: [
            {
                usuarioId: "user2",
                base64: "base64_encoded_image_string_of_books",
                alternativeText: "Shelves full of colorful books"
            }
        ]
    },
];

// Datos iniciales para Valoraciones
export const valoraciones: Valoracion[] = [
    {
        placeId: "place1",
        userId: "user1",
        fisica: {
            entrada: 4,
            rampas: 5,
            taza_bano: 0,
            ascensores: 0,
            pasillos: 0,
            banos_adaptados: 0,
            senaletica_clara: 0
        },
        sensorial: {
            senaletica_braille: 4,
            sistemas_amplificacion: 0,
            iluminacion_adecuada: 0,
            informacion_accesible: 0,
            pictogramas_claros: 2
        },
        psiquica: {
            espacios_tranquilos: 5,
            informacion_simple: 3,
            senaletica_intuitiva: 0,
            interaccion_personal: 0
        }
    },
];



export const seedUsuarios = async () => {
    await UsuarioModel.deleteMany({}); // Limpiar la colección de usuarios

    // Crear nuevos usuarios con _id generado
    const newUsuarios = usuarios.map(usuario => ({
        ...usuario,
        _id: new mongoose.Types.ObjectId(), // Generar un nuevo ObjectId para cada usuario
    }));
    usuarios = newUsuarios;

    // Encriptar las contraseñas de los usuarios
    const usuariosConPasswordsEncriptadas = await hashUserPasswords(newUsuarios);

    // Insertar los usuarios en la base de datos
    await UsuarioModel.insertMany(usuariosConPasswordsEncriptadas);
};




export const seedValoraciones = async () => {
    await ValoracionModel.deleteMany({});
    await ValoracionModel.insertMany(valoraciones);
};

export const seedSitios = async () => {
    await SitioModel.deleteMany({});
    await SitioModel.insertMany(sitios);
};



