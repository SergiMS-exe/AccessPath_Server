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
exports.deletePhotoService = exports.postPhotoService = exports.deleteReviewService = exports.editReviewService = exports.postReviewService = exports.getCommentsService = exports.deleteCommentService = exports.editCommentService = exports.postCommentService = exports.getPlacesByTextService = exports.getClosePlacesService = void 0;
const mongodb_1 = require("mongodb");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
const google_handle_1 = require("../utils/google.handle");
const auxiliar_handle_1 = require("../utils/auxiliar.handle");
const getClosePlacesService = (location, radius, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const closePlaces = yield sitioModel_1.default.find({
        $or: [
            { "valoraciones": { $exists: true, $ne: {} } },
            { "comentarios": { $exists: true, $ne: [] } },
            { "fotos": { $exists: true, $ne: [] } }
        ],
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude]
                },
                $maxDistance: radius
            }
        }
    }).limit(limit);
    if (closePlaces) {
        return { sitios: closePlaces };
    }
    else {
        return { error: "No se pudo encontrar ningun lugar cercano", status: 404 };
    }
});
exports.getClosePlacesService = getClosePlacesService;
const getPlacesByTextService = (text) => __awaiter(void 0, void 0, void 0, function* () {
    let sitesFromGooglePlaces = [];
    let sitesFromDB = [];
    try {
        sitesFromGooglePlaces = yield (0, google_handle_1.handleFindSitesByTextGoogle)(text);
    }
    catch (error) {
        return { error: "Error al buscar sitios en Google Places: " + error.message, status: 500 };
    }
    try {
        sitesFromDB = yield sitioModel_1.default.find({ placeId: { $in: sitesFromGooglePlaces.map(site => site.placeId) } });
    }
    catch (error) {
        return { error: "Error al buscar sitios en la base de datos: " + error.message, status: 500 };
    }
    if (sitesFromDB.length > 0) {
        sitesFromGooglePlaces.forEach((siteFromGooglePlaces, index) => {
            const siteFromDB = sitesFromDB.find(site => site.placeId === siteFromGooglePlaces.placeId);
            if (siteFromDB) {
                sitesFromGooglePlaces[index] = siteFromDB;
            }
        });
    }
    return { sitios: sitesFromGooglePlaces };
});
exports.getPlacesByTextService = getPlacesByTextService;
//Comentarios-------------------------------------------------------------------------------------------
const postCommentService = (comment, place) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Primero, buscamos el sitio usando el placeId
        const site = yield sitioModel_1.default.findOne({ placeId: place.placeId });
        // Creamos un nuevo comentario con los datos proporcionados
        const newComment = {
            _id: new mongodb_1.ObjectId(),
            date: new Date(),
            texto: comment.texto,
            usuarioId: comment.usuarioId
        };
        // Si no encontramos el sitio, lo creamos
        if (!site) {
            const newSite = Object.assign(Object.assign({}, place), { comentarios: [newComment] // Inicializamos el array de comentarios con el comentario proporcionado
             });
            const createdSite = new sitioModel_1.default(newSite);
            yield createdSite.save();
            return { status: 200, newPlace: newSite, comment: newComment };
        }
        // Si el sitio ya existe, simplemente añadimos el comentario al array de comentarios
        if (!site.comentarios)
            site.comentarios = []; // Si el campo comentarios no existe, lo inicializamos como un array vacío
        site.comentarios.push(newComment);
        yield site.save();
        return { status: 200, newPlace: site, comment: newComment };
    }
    catch (error) {
        console.error("Error al publicar comentario:", error.message); // Puedes registrar el error para futuras revisiones
        return { status: 500, error: "Error al guardar el comentario: " + error.message };
    }
});
exports.postCommentService = postCommentService;
const editCommentService = (placeId, commentId, newText) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId, "comentarios._id": commentId }, { $set: { "comentarios.$.texto": newText } }, { new: true, rawResult: true });
        if (updateResult.ok && updateResult.value) {
            // Encuentra el comentario específico en la lista actualizada de comentarios.
            const editedComment = (_b = (_a = updateResult.value) === null || _a === void 0 ? void 0 : _a.comentarios) === null || _b === void 0 ? void 0 : _b.find(comment => comment._id.toString() === commentId);
            // Si el comentario no se encuentra (aunque esto es poco probable porque acaba de ser actualizado), devuelve un error.
            if (!editedComment) {
                return { error: "Error al recuperar el comentario editado", status: 500 };
            }
            return { status: 200, editedComment };
        }
        else if (updateResult.value === null) {
            return { error: "No hay un sitio registrado con ese placeId", status: 404 };
        }
        else {
            return { error: "No se pudo editar el comentario", status: 500 };
        }
    }
    catch (error) {
        console.error("Error al editar el comentario:", error.message);
        return { error: "Error al editar el comentario: " + error.message, status: 500 };
    }
});
exports.editCommentService = editCommentService;
const deleteCommentService = (commentId, placeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId }, { $pull: { comentarios: { _id: commentId } } }, { new: true });
        if (response) {
            return { newPlace: response };
        }
        else {
            return { error: "No se ha encontrado un sitio con ese id", status: 404 };
        }
    }
    catch (error) {
        console.error("Error al eliminar el comentario:", error);
        return { error: "No se pudo eliminar el comentario", status: 500 };
    }
});
exports.deleteCommentService = deleteCommentService;
const getCommentsService = (placeId) => __awaiter(void 0, void 0, void 0, function* () {
    const siteFound = yield sitioModel_1.default.findOne({ placeId: placeId });
    if (!siteFound) {
        return { comentarios: [] };
    }
    else {
        const siteFoundObj = siteFound.toObject();
        if (siteFoundObj.comentarios) {
            for (let i = 0; i < siteFoundObj.comentarios.length; i++) {
                const comment = siteFoundObj.comentarios[i];
                const user = yield usuarioModel_1.default.findOne({ _id: comment.usuarioId });
                if (user) {
                    delete siteFoundObj.comentarios[i].usuarioId;
                    siteFoundObj.comentarios[i].usuario = {
                        _id: user._id,
                        nombre: user.nombre,
                        apellidos: user.apellidos
                    };
                }
                else {
                    delete siteFoundObj.comentarios[i].usuarioId;
                    siteFoundObj.comentarios[i].usuario = {
                        _id: new mongodb_1.ObjectId(comment.usuarioId),
                        nombre: "Usuario",
                        apellidos: "No Encontrado"
                    };
                }
            }
            return { comentarios: siteFoundObj.comentarios };
        }
        else
            return { comentarios: [] };
    }
});
exports.getCommentsService = getCommentsService;
//Valoraciones----------------------------------------------------------------------------------------
const postReviewService = (userId, place, valoracion) => __awaiter(void 0, void 0, void 0, function* () {
    const newValoracion = { placeId: place.placeId, userId: userId, fisica: valoracion.fisica, sensorial: valoracion.sensorial, psiquica: valoracion.psiquica };
    const insertResult = yield valoracionModel_1.default.create(newValoracion);
    if (insertResult) {
        const newAveragesResult = yield (0, auxiliar_handle_1.updateAverages)(place);
        if (newAveragesResult && !newAveragesResult.error) {
            return { newPlace: newAveragesResult.newPlace };
        }
        else {
            return { error: "No se pudo actualizar el promedio", status: 500 };
        }
    }
    else {
        return { error: "No se pudo guardar la valoracion", status: 500 };
    }
});
exports.postReviewService = postReviewService;
const editReviewService = (placeId, userId, valoracion) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const update = {};
        if (valoracion.fisica !== undefined) {
            update['fisica'] = valoracion.fisica;
        }
        else {
            update['$unset'] = { fisica: "" };
        }
        if (valoracion.sensorial !== undefined) {
            update['sensorial'] = valoracion.sensorial;
        }
        else {
            update['$unset'] = Object.assign(Object.assign({}, update['$unset']), { sensorial: "" });
        }
        if (valoracion.psiquica !== undefined) {
            update['psiquica'] = valoracion.psiquica;
        }
        else {
            update['$unset'] = Object.assign(Object.assign({}, update['$unset']), { psiquica: "" });
        }
        const editResult = yield valoracionModel_1.default.findOneAndUpdate({ placeId: placeId, userId: userId }, update, { new: true, rawResult: true });
        if (editResult.ok && editResult.value) {
            const newAveragesResult = yield (0, auxiliar_handle_1.updateAverages)((_c = editResult.value) === null || _c === void 0 ? void 0 : _c.placeId);
            if (newAveragesResult && !newAveragesResult.error) {
                return { newPlace: newAveragesResult.newPlace, status: 200 };
            }
            else {
                return { error: "No se pudo actualizar el promedio", status: 500 };
            }
        }
        else {
            return { error: "No se pudo editar la valoracion", status: 500 };
        }
    }
    catch (error) {
        console.error("Error al editar la valoracion:", error.message);
        return { error: "Error al editar la valoracion: " + error.message, status: 500 };
    }
});
exports.editReviewService = editReviewService;
const deleteReviewService = (placeId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //delete from userId and placeId
        const deleteResult = yield valoracionModel_1.default.findOneAndDelete({ placeId: placeId, userId: userId });
        if (deleteResult) {
            const newAveragesResult = yield (0, auxiliar_handle_1.updateAverages)(deleteResult.placeId);
            if (newAveragesResult && !newAveragesResult.error) {
                return { newPlace: newAveragesResult.newPlace, status: 200 };
            }
            else {
                return { error: "No se pudo actualizar el promedio", status: 500 };
            }
        }
        else {
            return { error: "No se pudo eliminar la valoracion", status: 500 };
        }
    }
    catch (error) {
        console.error("Error al eliminar la valoracion:", error.message);
        return { error: "Error al eliminar la valoracion: " + error.message, status: 500 };
    }
});
exports.deleteReviewService = deleteReviewService;
//Fotos-------------------------------------------------------------------------------------------
const postPhotoService = (place, photo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const site = yield sitioModel_1.default.findOne({ placeId: place.placeId });
        // Si no encontramos el sitio, lo creamos
        if (!site) {
            const newSite = Object.assign(Object.assign({}, place), { fotos: [photo] });
            const createdSite = new sitioModel_1.default(newSite);
            yield createdSite.save();
            return { newPlace: createdSite };
        }
        // Si el sitio ya existe, simplemente añadimos la foto al array de fotos
        if (!site.fotos)
            site.fotos = []; // Si el campo fotos no existe, lo inicializamos como un array vacío
        site.fotos.push(photo);
        yield site.save();
        return { newPlace: site };
    }
    catch (error) {
        console.error("Error al enviar la foto:", error);
        return { error: "No se pudo guardar la foto", status: 500 };
    }
});
exports.postPhotoService = postPhotoService;
const deletePhotoService = (photoId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield sitioModel_1.default.findOneAndUpdate({ "fotos._id": photoId }, { $pull: { fotos: { _id: photoId } } }, { new: true, rawResult: true });
        if (response.ok && response.value) {
            return { newPlace: response.value };
        }
        else {
            return { error: "No se pudo eliminar la foto", status: 500 };
        }
    }
    catch (error) {
        console.error("Error al eliminar la foto:", error);
        return { error: "No se pudo eliminar la foto", status: 500 };
    }
});
exports.deletePhotoService = deletePhotoService;
