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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyController = exports.getSavedSitesController = exports.unsaveSiteController = exports.saveSiteController = exports.deleteUserController = exports.registerUserController = exports.logInUserController = void 0;
const error_handle_1 = require("../utils/error.handle");
const usuariosService_1 = require("../services/usuariosService");
const logInUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.email || !req.body.password)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        else {
            const responseLogIn = yield (0, usuariosService_1.logInUserService)({ email: req.body.email, password: req.body.password });
            //Check if the user was logged in
            if (responseLogIn.error) {
                res.status(responseLogIn.status).send({ msg: responseLogIn.error });
            }
            else {
                res.status(200).send({ msg: "Sesion iniciada correctamente", user: responseLogIn.usuario });
            }
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el login: " + e.message);
    }
    finally {
        next();
    }
});
exports.logInUserController = logInUserController;
const registerUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, nombre, apellidos, tipoDiscapacidad, saved } = req.body;
        if (!email || !password || !nombre || !apellidos || !tipoDiscapacidad)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        const responseReg = yield (0, usuariosService_1.registerUsuarioService)({
            email: email,
            password: password,
            saved: saved,
            nombre: nombre,
            apellidos: apellidos,
            tipoDiscapacidad: tipoDiscapacidad,
        });
        //Check if the user was created
        if (responseReg.error) {
            res.status(responseReg.status).send({ msg: responseReg.error });
        }
        else {
            res.status(200).send({ msg: "Usuario creado correctamente", user: responseReg.usuario });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el registro: " + e.message);
    }
    finally {
        next();
    }
});
exports.registerUserController = registerUserController;
const deleteUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.userId)
            return (0, error_handle_1.handleHttp)(res, "Falta el userId en los parametros", 400);
        const responseDelete = yield (0, usuariosService_1.deleteUsuarioService)(req.params.userId);
        if (responseDelete.error) {
            res.status(responseDelete.status).send({ msg: responseDelete.error });
        }
        else {
            res.status(200).send({ msg: "Usuario borrado correctamente" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el borrado de usuario: " + e.message);
    }
    finally {
        next();
    }
});
exports.deleteUserController = deleteUserController;
const saveSiteController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.userId || !req.body.site)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        const responseSave = yield (0, usuariosService_1.saveSiteService)(req.body.userId, req.body.site);
        if (responseSave.error) {
            res.status(responseSave.status).send({ msg: responseSave.error });
        }
        else {
            res.status(200).send({ msg: "Sitio guardado correctamente" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en guardado de sitio: " + e.message);
    }
    finally {
        next();
    }
});
exports.saveSiteController = saveSiteController;
const unsaveSiteController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.userId || !req.body.placeId)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        const responseUnsave = yield (0, usuariosService_1.unsaveSiteService)(req.body.userId, req.body.placeId);
        if (responseUnsave.error) {
            res.status(responseUnsave.status).send({ msg: responseUnsave.error });
        }
        else {
            res.status(200).send({ msg: "Sitio eliminado correctamente de la lista de guardados" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en guardado de sitio: " + e.message);
    }
    finally {
        next();
    }
});
exports.unsaveSiteController = unsaveSiteController;
const getSavedSitesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.userId)
            return (0, error_handle_1.handleHttp)(res, "Falta el userId en los parametros", 400);
        const responseGetSaved = yield (0, usuariosService_1.getSavedSitesService)(req.params.userId);
        if (responseGetSaved.error) {
            res.status(responseGetSaved.status).send({ msg: responseGetSaved.error });
        }
        else {
            res.status(200).send({ msg: "Sitios obtenidos correctamente", saved: responseGetSaved.savedSites });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en guardado de sitio: " + e.message);
    }
    finally {
        next();
    }
});
exports.getSavedSitesController = getSavedSitesController;
const dummyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ msg: "Server up" });
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en dummy: " + e);
    }
});
exports.dummyController = dummyController;
