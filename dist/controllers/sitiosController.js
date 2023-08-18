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
exports.getCommentsController = exports.deleteCommentController = exports.editCommentController = exports.postCommentController = exports.getNearPlaces = void 0;
const error_handle_1 = require("../utils/error.handle");
const sitiosService_1 = require("../services/sitiosService");
const getNearPlaces = () => { };
exports.getNearPlaces = getNearPlaces;
const postCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.comment || !req.body.site || !req.body.comment.usuarioId || !req.body.comment.texto || req.body.comment.texto.trim().length < 1) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const postCommentResponse = yield (0, sitiosService_1.postCommentService)(req.body.comment, req.body.site);
        if (postCommentResponse.error) {
            res.status(postCommentResponse.status).send({ msg: postCommentResponse.error });
        }
        else {
            res.status(200).send({ msg: "Comentario enviado correctamente", comment: postCommentResponse.comment });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el envio de comentario: " + e);
    }
    finally {
        next();
    }
});
exports.postCommentController = postCommentController;
const editCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.placeId) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en los parametros", 400);
        }
        const { commentId, newText } = req.body;
        if (!commentId || !newText || newText.trim().length < 1) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const editCommentResponse = yield (0, sitiosService_1.editCommentService)(req.params.placeId, commentId, newText);
        if (editCommentResponse.error) {
            res.status(editCommentResponse.status).send({ msg: editCommentResponse.error });
        }
        else {
            res.send({ msg: "Comentario editado correctamente", newComment: editCommentResponse.editedComment });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la edicion de comentario: " + e);
    }
    finally {
        next();
    }
});
exports.editCommentController = editCommentController;
const deleteCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId, placeId } = req.params;
        if (!placeId || !commentId) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en los parametros", 400);
        }
        const deleteCommentResponse = yield (0, sitiosService_1.deleteCommentService)(commentId, placeId);
        if (deleteCommentResponse.error) {
            res.status(deleteCommentResponse.status).send({ msg: deleteCommentResponse.error });
        }
        else {
            res.status(200).send({ msg: "Comentario eliminado correctamente" });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la eliminacion de comentario: " + e);
    }
    finally {
        next();
    }
});
exports.deleteCommentController = deleteCommentController;
const getCommentsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeId = req.query.placeId;
        if (!placeId) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en los parametros", 400);
        }
        const getCommentsResponse = yield (0, sitiosService_1.getCommentsService)(placeId);
        if (getCommentsResponse.error) {
            res.status(getCommentsResponse.status).send({ msg: getCommentsResponse.error });
        }
        else {
            res.status(200).send({ msg: "Comentarios obtenidos correctamente", comentarios: getCommentsResponse.comentarios });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la obtencion de comentarios: " + e);
    }
    finally {
        next();
    }
});
exports.getCommentsController = getCommentsController;
