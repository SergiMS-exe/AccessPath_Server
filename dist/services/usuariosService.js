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
exports.editPasswordService = exports.editUserService = exports.getUserPhotosService = exports.getUserRatingsService = exports.getUserCommentsService = exports.getSavedSitesService = exports.unsaveSiteService = exports.saveSiteService = exports.deleteUsuarioService = exports.logInUserService = exports.registerUsuarioService = void 0;
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const bcrypt_handle_1 = require("../utils/bcrypt.handle");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const mongodb_1 = require("mongodb");
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
const pagination_util_1 = require("../utils/pagination.util");
const registerUsuarioService = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield usuarioModel_1.default.findOne({ email: usuario.email }))
        return { error: "Ya hay un usuario con ese email", status: 409 };
    usuario._id = new mongodb_1.ObjectId();
    usuario.password = yield (0, bcrypt_handle_1.encrypt)(usuario.password);
    const responseInsert = yield usuarioModel_1.default.create(usuario);
    return { usuario: responseInsert };
});
exports.registerUsuarioService = registerUsuarioService;
const logInUserService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    const userFound = yield usuarioModel_1.default.findOne({ email: email });
    if (!userFound)
        return { error: "No hay un usuario registrado con ese email", status: 404 };
    const passwdHash = userFound.password;
    const isPasswdCorrect = yield (0, bcrypt_handle_1.verified)(password, passwdHash);
    if (!isPasswdCorrect)
        return { error: "Contraseña incorrecta", status: 401 };
    return { usuario: userFound };
});
exports.logInUserService = logInUserService;
const deleteUsuarioService = (usuarioId) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield usuarioModel_1.default.findOneAndDelete({ _id: usuarioId });
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    else
        return { status: 200 };
});
exports.deleteUsuarioService = deleteUsuarioService;
const saveSiteService = (usuarioId, site) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    const savedPlaces = userFound.saved;
    //si no hay un sitio guardado en BD, se guarda
    yield sitioModel_1.default.findOneAndUpdate({ placeId: site.placeId }, site, { upsert: true });
    if (savedPlaces === null || savedPlaces === void 0 ? void 0 : savedPlaces.includes(site.placeId))
        return { error: "El sitio ya esta guardado", status: 409 };
    else {
        const updateResult = yield usuarioModel_1.default.updateOne({ _id: usuarioId }, { $push: { saved: site.placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
});
exports.saveSiteService = saveSiteService;
const unsaveSiteService = (usuarioId, placeId) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    const savedPlaces = userFound.saved;
    if (!(savedPlaces === null || savedPlaces === void 0 ? void 0 : savedPlaces.includes(placeId)))
        return { error: "El sitio ya se ha eliminado de la lista de guardados", status: 409 };
    else {
        const updateResult = yield usuarioModel_1.default.updateOne({ _id: usuarioId }, { $pull: { saved: placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
});
exports.unsaveSiteService = unsaveSiteService;
const getSavedSitesService = (usuarioId, paginationParams) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }
    const savedPlaces = userFound.saved || [];
    // Si no hay sitios guardados, devolver respuesta vacía con paginacion
    if (savedPlaces.length === 0) {
        return {
            savedSites: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: paginationParams.limit || 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }
    // Paginar primero los IDs
    const paginatedIds = (0, pagination_util_1.paginateArray)(savedPlaces, paginationParams);
    // Buscar solo los sitios de la pagina actual
    const savedSites = yield sitioModel_1.default.find({
        placeId: { $in: paginatedIds.data }
    }).lean();
    return {
        savedSites,
        pagination: paginatedIds.pagination
    };
});
exports.getSavedSitesService = getSavedSitesService;
const getUserCommentsService = (usuarioId, paginationParams) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }
    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;
    // Agregacion con paginacion
    const [sites, totalCount] = yield Promise.all([
        sitioModel_1.default.aggregate([
            { $unwind: "$comentarios" },
            { $match: { "comentarios.usuarioId": usuarioId } },
            {
                $group: {
                    _id: "$_id",
                    comentarios: { $push: "$comentarios" },
                    sitio: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$sitio", { comentarios: "$comentarios" }]
                    }
                }
            },
            { $project: { _id: 0 } },
            { $sort: { "comentarios.date": -1 } }, // Mas recientes primero
            { $skip: skip },
            { $limit: limit }
        ]),
        // Contar total de sitios con comentarios del usuario
        sitioModel_1.default.aggregate([
            { $unwind: "$comentarios" },
            { $match: { "comentarios.usuarioId": usuarioId } },
            { $group: { _id: "$_id" } },
            { $count: "total" }
        ])
    ]);
    const totalItems = ((_a = totalCount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(totalItems / limit);
    return {
        sites,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
});
exports.getUserCommentsService = getUserCommentsService;
const getUserRatingsService = (usuarioId, paginationParams) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }
    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;
    // Obtener valoraciones paginadas
    const [valoraciones, totalItems] = yield Promise.all([
        valoracionModel_1.default.find({ userId: usuarioId })
            .sort({ _id: -1 }) // Más recientes primero
            .skip(skip)
            .limit(limit)
            .lean(),
        valoracionModel_1.default.countDocuments({ userId: usuarioId })
    ]);
    // Para cada valoración, obtener el sitio
    const sitesWithValoracion = yield Promise.all(valoraciones.map((valoracion) => __awaiter(void 0, void 0, void 0, function* () {
        const site = yield sitioModel_1.default.findOne({ placeId: valoracion.placeId }).lean();
        if (site) {
            return { valoracion, site };
        }
        else {
            // Eliminar valoración huérfana
            yield valoracionModel_1.default.findOneAndDelete({ _id: valoracion._id });
            return null;
        }
    }))).then((sites) => sites.filter((value) => value !== null));
    const totalPages = Math.ceil(totalItems / limit);
    return {
        sitesWithValoracion,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
});
exports.getUserRatingsService = getUserRatingsService;
const getUserPhotosService = (usuarioId, paginationParams) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }
    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;
    // Agregación con paginación
    const [sites, totalCount] = yield Promise.all([
        sitioModel_1.default.aggregate([
            { $unwind: "$fotos" },
            { $match: { "fotos.usuarioId": usuarioId } },
            {
                $group: {
                    _id: "$_id",
                    fotos: { $push: "$fotos" },
                    sitio: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$sitio", { fotos: "$fotos" }]
                    }
                }
            },
            { $project: { _id: 0 } },
            { $skip: skip },
            { $limit: limit }
        ]),
        // Contar total de sitios con fotos del usuario
        sitioModel_1.default.aggregate([
            { $unwind: "$fotos" },
            { $match: { "fotos.usuarioId": usuarioId } },
            { $group: { _id: "$_id" } },
            { $count: "total" }
        ])
    ]);
    const totalItems = ((_a = totalCount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(totalItems / limit);
    return {
        sites,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
});
exports.getUserPhotosService = getUserPhotosService;
const editUserService = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuario._id.toString());
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    const userUpdated = yield usuarioModel_1.default.updateOne({ _id: usuario._id }, usuario);
    if (userUpdated.modifiedCount === 1)
        return { status: 200 };
    else
        return { error: "Se debe modificar algún campo para poder editar el perfil", status: 500 };
});
exports.editUserService = editUserService;
const editPasswordService = (usuarioId, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    const passwdHash = userFound.password;
    const isPasswdCorrect = yield (0, bcrypt_handle_1.verified)(oldPassword, passwdHash);
    if (!isPasswdCorrect)
        return { error: "Contraseña actual incorrecta", status: 401 };
    const newPasswdHash = yield (0, bcrypt_handle_1.encrypt)(newPassword);
    const userUpdated = yield usuarioModel_1.default.updateOne({ _id: usuarioId }, { password: newPasswdHash });
    if (userUpdated.modifiedCount === 1)
        return { status: 200 };
    else
        return { error: "No se pudo actualizar la contraseña", status: 500 };
});
exports.editPasswordService = editPasswordService;
//Utils
const getUserInDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield usuarioModel_1.default.findOne({ _id: userId });
    return userFound;
});
