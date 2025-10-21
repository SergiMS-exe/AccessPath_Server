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
exports.dummyController = exports.editPasswordController = exports.editUserController = exports.getUserRatingsController = exports.getUserPhotosController = exports.getUserCommentsController = exports.getSavedSitesController = exports.unsaveSiteController = exports.saveSiteController = exports.deleteUserController = exports.registerUserController = exports.logInUserController = exports.usersIndexController = void 0;
const error_handle_1 = require("../utils/error.handle");
const usuariosService_1 = require("../services/usuariosService");
const validator_handle_1 = require("../utils/validator.handle");
const pagination_middleware_1 = require("../middleware/pagination.middleware");
const usersIndexController = (req, res, next) => {
    res.json({
        availableSubendpoints: [
            {
                path: "/login",
                method: "POST",
                description: "User login",
                body: ["email", "password"]
            },
            {
                path: "/register",
                method: "POST",
                description: "Register new user",
                body: ["username", "password", "email"]
            },
            {
                path: "/password/:userId",
                method: "PUT",
                description: "Edit user password",
                params: ["userId"],
                body: ["password"]
            },
            {
                path: "/saveSite",
                method: "PUT",
                description: "Save a site",
                body: ["siteId"]
            },
            {
                path: "/unsaveSite",
                method: "PUT",
                description: "Unsave a site",
                body: ["siteId"]
            },
            {
                path: "/savedSites/:userId",
                method: "GET",
                description: "Get saved sites of a user",
                params: ["userId"]
            },
            {
                path: "/comments/:userId",
                method: "GET",
                description: "Get comments of a user",
                params: ["userId"]
            },
            {
                path: "/ratings/:userId",
                method: "GET",
                description: "Get ratings of a user",
                params: ["userId"]
            },
            {
                path: "/photos/:userId",
                method: "GET",
                description: "Get photos uploaded by a user",
                params: ["userId"]
            },
            {
                path: "/:userId",
                method: "DELETE",
                description: "Delete a user",
                params: ["userId"]
            },
            {
                path: "/:userId",
                method: "PUT",
                description: "Edit user details",
                params: ["userId"],
                body: ["userData"]
            }
        ]
    });
};
exports.usersIndexController = usersIndexController;
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
        const { email, password, confirmPassword, nombre, apellidos, tipoDiscapacidad, saved } = req.body;
        if (!email || !password || !confirmPassword || !nombre || !apellidos || !tipoDiscapacidad)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        const checkedEmail = (0, validator_handle_1.checkEmail)(email);
        const checkedPassword = (0, validator_handle_1.checkPassword)(password);
        const checkedPasswordsConfirm = (0, validator_handle_1.checkPasswordsConfirm)(password, confirmPassword);
        if (checkedEmail.error)
            return (0, error_handle_1.handleHttp)(res, checkedEmail.error, checkedEmail.status);
        if (checkedPassword.error)
            return (0, error_handle_1.handleHttp)(res, checkedPassword.error, checkedPassword.status);
        if (checkedPasswordsConfirm.error)
            return (0, error_handle_1.handleHttp)(res, checkedPasswordsConfirm.error, checkedPasswordsConfirm.status);
        const responseReg = yield (0, usuariosService_1.registerUsuarioService)({
            email: email,
            password: password,
            saved: saved ? saved : [], //TODO quitar
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
});
exports.unsaveSiteController = unsaveSiteController;
const getSavedSitesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.userId) {
            return (0, error_handle_1.handleHttp)(res, "Falta el userId en los parametros", 400);
        }
        const paginationParams = (0, pagination_middleware_1.extractPaginationParams)(req.query);
        const responseGetSaved = yield (0, usuariosService_1.getSavedSitesService)(req.params.userId, paginationParams);
        if (responseGetSaved.error) {
            return res.status(responseGetSaved.status).send({ msg: responseGetSaved.error });
        }
        res.locals.sitios = responseGetSaved.savedSites;
        res.locals.pagination = responseGetSaved.pagination;
        res.locals.mensaje = "Sitios guardados obtenidos correctamente";
        res.status(200);
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en guardado de sitio: " + e.message);
    }
    finally {
        next();
    }
});
exports.getSavedSitesController = getSavedSitesController;
const getUserCommentsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paginationParams = (0, pagination_middleware_1.extractPaginationParams)(req.query);
        const responseGetComments = yield (0, usuariosService_1.getUserCommentsService)(req.params.userId, paginationParams);
        if (responseGetComments.error) {
            res.status(responseGetComments.status).send({ msg: responseGetComments.error });
        }
        else {
            res.locals.sitios = responseGetComments.sites;
            res.locals.pagination = responseGetComments.pagination;
            res.locals.mensaje = "Comentarios obtenidos correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en obtencion de comentarios del usuario: " + e.message);
    }
    finally {
        next();
    }
});
exports.getUserCommentsController = getUserCommentsController;
const getUserRatingsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paginationParams = (0, pagination_middleware_1.extractPaginationParams)(req.query);
        const responseGetRatings = yield (0, usuariosService_1.getUserRatingsService)(req.params.userId, paginationParams);
        if (responseGetRatings.error) {
            res.status(responseGetRatings.status).send({ msg: responseGetRatings.error });
        }
        else {
            res.locals.sitiosConValoracion = responseGetRatings.sitesWithValoracion;
            res.locals.pagination = responseGetRatings.pagination;
            res.locals.mensaje = "Valoraciones obtenidas correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en obtencion de valoraciones del usuario: " + e.message);
    }
    finally {
        next();
    }
});
exports.getUserRatingsController = getUserRatingsController;
const getUserPhotosController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paginationParams = (0, pagination_middleware_1.extractPaginationParams)(req.query);
        const responseGetPhotos = yield (0, usuariosService_1.getUserPhotosService)(req.params.userId, paginationParams);
        if (responseGetPhotos.error) {
            res.status(responseGetPhotos.status).send({ msg: responseGetPhotos.error });
        }
        else {
            res.locals.sitios = responseGetPhotos.sites;
            res.locals.pagination = responseGetPhotos;
            res.locals.mensaje = "Fotos obtenidas correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en obtencion de fotos del usuario: " + e.message);
    }
    finally {
        next();
    }
});
exports.getUserPhotosController = getUserPhotosController;
const editUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, nombre, apellidos, email, tipoDiscapacidad } = req.body.person;
        if (!req.body.person || !_id || !nombre || !apellidos || !email || !tipoDiscapacidad)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        //Person interface
        const user = {
            _id: _id,
            nombre: nombre,
            apellidos: apellidos,
            email: email,
            tipoDiscapacidad: tipoDiscapacidad
        };
        const responseEdit = yield (0, usuariosService_1.editUserService)(user);
        if (responseEdit.error) {
            res.status(responseEdit.status).send({ msg: responseEdit.error });
        }
        else {
            res.status(200).send({ msg: "Usuario editado correctamente" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en edición del usuario: " + e.message);
    }
});
exports.editUserController = editUserController;
const editPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword)
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        const checkedPassword = (0, validator_handle_1.checkPassword)(newPassword);
        const checkedPasswordsConfirm = (0, validator_handle_1.checkPasswordsConfirm)(newPassword, confirmNewPassword);
        if (checkedPassword.error)
            return (0, error_handle_1.handleHttp)(res, checkedPassword.error, checkedPassword.status);
        if (checkedPasswordsConfirm.error)
            return (0, error_handle_1.handleHttp)(res, checkedPasswordsConfirm.error, checkedPasswordsConfirm.status);
        const response = yield (0, usuariosService_1.editPasswordService)(req.params.userId, oldPassword, newPassword);
        if (response.error) {
            res.status(response.status).send({ msg: response.error });
        }
        else {
            res.status(200).send({ msg: "Contraseña editada correctamente" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en edicion de usuario: " + e.message);
    }
});
exports.editPasswordController = editPasswordController;
const dummyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ msg: "Server up" });
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en dummy: " + e);
    }
});
exports.dummyController = dummyController;
