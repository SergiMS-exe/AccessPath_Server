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
exports.getSavedSitesService = exports.unsaveSiteService = exports.saveSiteService = exports.deleteUsuarioService = exports.logInUserService = exports.registerUsuarioService = void 0;
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const bcrypt_handle_1 = require("../utils/bcrypt.handle");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const mongodb_1 = require("mongodb");
const registerUsuarioService = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield usuarioModel_1.default.findOne({ email: usuario.email }))
        return { error: "Ya hay un usuario con ese email", status: 409 };
    usuario._id = new mongodb_1.ObjectId();
    usuario.password = yield (0, bcrypt_handle_1.encrypt)(usuario.password);
    const responseInsert = yield usuarioModel_1.default.create(usuario);
    return { usuario: responseInsert };
});
exports.registerUsuarioService = registerUsuarioService;
const logInUserService = ({ email, password }) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield usuarioModel_1.default.findOne({ email: email });
    if (!userFound)
        return { error: "No hay un usuario registrado con ese email", status: 404 };
    const passwdHash = userFound.password;
    const isPasswdCorrect = yield (0, bcrypt_handle_1.verified)(password, passwdHash);
    if (!isPasswdCorrect)
        return { error: "Contraseña incorrecta", status: 401 };
    //TODO ver si hacer jwt
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
        return { error: "El sitio ya está guardado", status: 409 };
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
const getSavedSitesService = (usuarioId) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield getUserInDB(usuarioId);
    if (!userFound)
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    const savedPlaces = userFound.saved;
    if (!savedPlaces)
        return { error: "No hay sitios guardados", status: 404 };
    const savedSites = yield sitioModel_1.default.find({ placeId: { $in: savedPlaces } });
    return { savedSites };
});
exports.getSavedSitesService = getSavedSitesService;
//Utils
const getUserInDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield usuarioModel_1.default.findOne({ _id: userId });
    return userFound;
});
