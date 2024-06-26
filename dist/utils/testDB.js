"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSitios = exports.seedValoraciones = exports.seedUsuarios = exports.valoraciones = exports.sitios = exports.usuarios = exports.closeTestDb = exports.setUpDBData = exports.initializeTestDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
const bcrypt_handle_1 = require("./bcrypt.handle");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const initializeTestDb = () => __awaiter(void 0, void 0, void 0, function* () {
    // Conectar a la base de datos de pruebas
    const mongoMemoryServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const DB_URI = mongoMemoryServer.getUri();
    yield mongoose_1.default.connect(DB_URI, { dbName: 'test' });
    yield (0, exports.setUpDBData)();
});
exports.initializeTestDb = initializeTestDb;
const clearTestDb = () => __awaiter(void 0, void 0, void 0, function* () {
    // Eliminar todos los datos de la base de datos de pruebas
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        yield collection.deleteMany({});
    }
});
const setUpDBData = () => __awaiter(void 0, void 0, void 0, function* () {
    // Insertar datos iniciales en la base de datos de pruebas
    yield clearTestDb();
    yield (0, exports.seedSitios)();
    yield (0, exports.seedUsuarios)();
    yield (0, exports.seedValoraciones)();
});
exports.setUpDBData = setUpDBData;
const closeTestDb = () => __awaiter(void 0, void 0, void 0, function* () {
    // Cerrar la conexión con la base de datos de pruebas
    //await mongoose.connection.dropDatabase();
    yield mongoose_1.default.connection.close();
});
exports.closeTestDb = closeTestDb;
exports.usuarios = [
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
exports.sitios = [
    {
        placeId: "place1",
        nombre: "Café Central",
        direccion: "Calle Falsa 123",
        calificacionGoogle: 4.2,
        location: {
            type: "Point",
            coordinates: [-80.133208, 19.4326077]
        },
        types: ["cafe", "bakery"],
        comentarios: [
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                usuarioId: new mongoose_1.default.Types.ObjectId(), // ID de usuario de ejemplo, posiblemente inexistente
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
                _id: new mongoose_1.default.Types.ObjectId(),
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
            coordinates: [-80.135208, 19.4327087]
        },
        types: ["library", "store"],
        comentarios: [],
        valoraciones: {},
        fotos: [
            {
                _id: new mongoose_1.default.Types.ObjectId(),
                usuarioId: "user2",
                base64: "base64_encoded_image_string_of_books",
                alternativeText: "Shelves full of colorful books"
            }
        ]
    },
];
// Datos iniciales para Valoraciones
exports.valoraciones = [
    {
        placeId: exports.sitios[0].placeId,
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
const seedUsuarios = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield usuarioModel_1.default.deleteMany({}); // Limpiar la colección de usuarios
    // Crear nuevos usuarios con _id generado
    const newUsuarios = exports.usuarios.map(usuario => (Object.assign(Object.assign({}, usuario), { _id: new mongoose_1.default.Types.ObjectId() })));
    exports.usuarios = newUsuarios;
    exports.valoraciones[0].userId = (_a = exports.usuarios[0]._id) === null || _a === void 0 ? void 0 : _a.toString(); // Asignar el ID del usuario a la valoración
    // Encriptar las contraseñas de los usuarios
    const usuariosConPasswordsEncriptadas = yield (0, bcrypt_handle_1.hashUserPasswords)(newUsuarios);
    // Insertar los usuarios en la base de datos
    yield usuarioModel_1.default.insertMany(usuariosConPasswordsEncriptadas);
});
exports.seedUsuarios = seedUsuarios;
const seedValoraciones = () => __awaiter(void 0, void 0, void 0, function* () {
    yield valoracionModel_1.default.deleteMany({});
    yield valoracionModel_1.default.insertMany(exports.valoraciones);
});
exports.seedValoraciones = seedValoraciones;
const seedSitios = () => __awaiter(void 0, void 0, void 0, function* () {
    yield sitioModel_1.default.deleteMany({});
    yield sitioModel_1.default.insertMany(exports.sitios);
});
exports.seedSitios = seedSitios;
