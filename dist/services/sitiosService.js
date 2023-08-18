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
exports.getCommentsService = exports.deleteCommentService = exports.editCommentService = exports.postCommentService = void 0;
const mongodb_1 = require("mongodb");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const postCommentService = (comment, place) => __awaiter(void 0, void 0, void 0, function* () {
    const commentToInsert = {
        _id: new mongodb_1.ObjectId(),
        usuarioId: comment.usuarioId,
        texto: comment.texto,
        date: new Date(),
    };
    const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: place.placeId }, { $push: { comentarios: commentToInsert }, $setOnInsert: place }, { upsert: true, new: true });
    if (updateResult) {
        return { status: 200, newPlace: updateResult, comment: commentToInsert };
    }
    else {
        return { error: "No se pudo guardar el comentario", status: 500 };
    }
});
exports.postCommentService = postCommentService;
const editCommentService = (placeId, commentId, newText) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId, "comentarios._id": commentId }, { $set: { "comentarios.$.texto": newText } }, { new: true, rawResult: true });
    if (updateResult.ok) {
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
});
exports.editCommentService = editCommentService;
const deleteCommentService = (commentId, placeId) => __awaiter(void 0, void 0, void 0, function* () {
    const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId }, { $pull: { comentarios: { _id: commentId } } }, { new: true, rawResult: true });
    if (updateResult.ok) {
        return { status: 200, newPlace: updateResult };
    }
    else if (updateResult.value === null) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
    }
    else {
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
                    return { error: "Usuario no encontrado para el comentario", status: 500 };
                }
            }
            return { comentarios: siteFoundObj.comentarios };
        }
        else
            return { comentarios: [] };
    }
});
exports.getCommentsService = getCommentsService;
