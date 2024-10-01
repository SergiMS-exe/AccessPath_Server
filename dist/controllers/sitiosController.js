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
exports.deletePhotoController = exports.postPhotoController = exports.deleteReviewController = exports.editReviewController = exports.postReviewController = exports.getCommentsController = exports.deleteCommentController = exports.editCommentController = exports.postCommentController = exports.getLocationByLinkController = exports.getPlacesByTextController = exports.getClosePlacesController = exports.sitesIndexController = void 0;
const error_handle_1 = require("../utils/error.handle");
const sitiosService_1 = require("../services/sitiosService");
const mongodb_1 = require("mongodb");
const sitesIndexController = (req, res, next) => {
    res.json({
        availableSubendpoints: [
            {
                path: "/close",
                method: "GET",
                description: "Get close places",
                queryParams: ["location"]
            },
            {
                path: "/search",
                method: "GET",
                description: "Search places by text",
                queryParams: ["query"]
            },
            {
                path: "/comments",
                method: "GET",
                description: "Get comments for places",
                queryParams: ["placeId"]
            },
            {
                path: "/comment",
                method: "POST",
                description: "Post a comment",
                body: ["placeId", "content", "authorId"]
            },
            {
                path: "/comment/:placeId",
                method: "PUT",
                description: "Edit a comment",
                params: ["placeId", "commentId"],
                body: ["content"]
            },
            {
                path: "/comment/:placeId/:commentId",
                method: "DELETE",
                description: "Delete a comment",
                params: ["placeId", "commentId"]
            },
            {
                path: "/review",
                method: "POST",
                description: "Post a review",
                body: ["placeId", "rating", "content", "authorId"]
            },
            {
                path: "/review/:placeId",
                method: "PUT",
                description: "Edit a review",
                params: ["placeId", "reviewId"],
                body: ["rating", "content"]
            },
            {
                path: "/review/:placeId/:reviewId",
                method: "DELETE",
                description: "Delete a review",
                params: ["placeId", "reviewId"]
            },
            {
                path: "/photo",
                method: "POST",
                description: "Post a photo",
                body: ["placeId", "imageUrl", "authorId"]
            },
            {
                path: "/photo/:placeId/:photoId",
                method: "DELETE",
                description: "Delete a photo",
                params: ["placeId", "photoId"]
            }
        ]
    });
};
exports.sitesIndexController = sitesIndexController;
const getClosePlacesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.location)
            (0, error_handle_1.handleHttp)(res, "Faltan datos en la query", 400);
        else if (typeof req.query.location !== "string" || !req.query.location.includes('%'))
            (0, error_handle_1.handleHttp)(res, "El formato de la ubicacion es incorrecto", 400);
        const location = {
            latitude: parseFloat(req.query.location.split('%')[0]),
            longitude: parseFloat(req.query.location.split('%')[1])
        };
        const radius = req.query.radius ? parseInt(req.query.radius) : 100000; // 100km
        const limit = req.query.limit ? parseInt(req.query.limit) : 30;
        const closePlacesResponse = yield (0, sitiosService_1.getClosePlacesService)(location, radius, limit);
        if (closePlacesResponse.error) {
            res.status(closePlacesResponse.status).send({ msg: closePlacesResponse.error });
        }
        else {
            res.locals.sitios = closePlacesResponse.sitios;
            res.locals.mensaje = "Sitios cercanos obtenidos correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la obtencion de sitios cercanos: " + e.message);
    }
    finally {
        next();
    }
});
exports.getClosePlacesController = getClosePlacesController;
const getPlacesByTextController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var text = req.query.text;
        if (!text) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en la query", 400);
        }
        else if (typeof text !== "string") {
            return (0, error_handle_1.handleHttp)(res, "El formato del texto es incorrecto", 400);
        }
        //const getPlacesByTextResponse = await getPlacesByTextService(text);
        const getPlacesByTextResponse = yield (0, sitiosService_1.getPlacesByTextService)(text);
        if (getPlacesByTextResponse.error) {
            res.status(getPlacesByTextResponse.status).send({ msg: getPlacesByTextResponse.error });
        }
        else {
            res.locals.sitios = getPlacesByTextResponse.sitios;
            res.locals.mensaje = "Sitios obtenidos correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la obtencion de sitios por texto: " + e.message);
    }
    finally {
        next();
    }
});
exports.getPlacesByTextController = getPlacesByTextController;
const getLocationByLinkController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const link = req.query.link;
        if (!link) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en la query", 400);
        }
        else if (typeof link !== "string") {
            return (0, error_handle_1.handleHttp)(res, "El formato del link es incorrecto", 400);
        }
        const getLocationByLinkResponse = yield (0, sitiosService_1.getLocationByLinkService)(link);
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la obtencion de ubicacion por link: " + e.message);
    }
    finally {
        next();
    }
});
exports.getLocationByLinkController = getLocationByLinkController;
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
        (0, error_handle_1.handleHttp)(res, "Error en el envio de comentario: " + e.message);
    }
    finally {
        next();
    }
});
exports.postCommentController = postCommentController;
const editCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId, newText } = req.body;
        if (!commentId || !newText || newText.trim().length < 1) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const editCommentResponse = yield (0, sitiosService_1.editCommentService)(req.params.placeId, commentId, newText);
        if (editCommentResponse.error) {
            res.status(editCommentResponse.status).send({ msg: editCommentResponse.error });
        }
        else {
            res.status(200).send({ msg: "Comentario editado correctamente", newComment: editCommentResponse.editedComment });
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la edicion de comentario: " + e.message);
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
        (0, error_handle_1.handleHttp)(res, "Error en la eliminacion de comentario: " + e.message);
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
        res.status(200).send({ msg: "Comentarios obtenidos correctamente", comentarios: getCommentsResponse.comentarios });
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la obtencion de comentarios: " + e.message);
    }
    finally {
        next();
    }
});
exports.getCommentsController = getCommentsController;
const postReviewController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.review || !req.body.site || !req.body.usuarioId || Object.keys(req.body.review).length === 0) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const usuarioId = req.body.usuarioId;
        const place = req.body.site;
        const review = req.body.review;
        const postReviewResponse = yield (0, sitiosService_1.postReviewService)(usuarioId, place, review);
        if (postReviewResponse.error) {
            res.status(postReviewResponse.status).send({ msg: postReviewResponse.error });
        }
        else {
            res.locals.newPlace = postReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion enviada correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el envio de valoracion: " + e.message);
    }
    finally {
        next();
    }
});
exports.postReviewController = postReviewController;
const editReviewController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.review || Object.keys(req.body.review).length === 0) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const review = req.body.review;
        const placeId = req.params.placeId;
        const userId = req.params.userId;
        const editReviewResponse = yield (0, sitiosService_1.editReviewService)(placeId, userId, review);
        if (editReviewResponse.error) {
            res.status(editReviewResponse.status).send({ msg: editReviewResponse.error });
        }
        else {
            res.locals.newPlace = editReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion editada correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la edicion de valoracion: " + e.message);
    }
    finally {
        next();
    }
});
exports.editReviewController = editReviewController;
const deleteReviewController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeId = req.params.placeId;
        const userId = req.params.userId;
        const deleteReviewResponse = yield (0, sitiosService_1.deleteReviewService)(placeId, userId);
        if (deleteReviewResponse.error) {
            res.status(deleteReviewResponse.status).send({ msg: deleteReviewResponse.error });
        }
        else {
            res.locals.newPlace = deleteReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion eliminada correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la eliminacion de valoracion: " + e.message);
    }
    finally {
        next();
    }
});
exports.deleteReviewController = deleteReviewController;
const postPhotoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { photo, site } = req.body;
        if (!photo || !site || !photo.base64 || !photo.usuarioId || !photo.alternativeText) {
            return (0, error_handle_1.handleHttp)(res, "Faltan datos en el body", 400);
        }
        const photoWithId = Object.assign(Object.assign({}, photo), { _id: new mongodb_1.ObjectId() });
        const parsedSite = typeof site === "string" ? JSON.parse(site) : site;
        const postPhotoResponse = yield (0, sitiosService_1.postPhotoService)(parsedSite, photoWithId);
        if (postPhotoResponse.error) {
            res.status(postPhotoResponse.status).send({ msg: postPhotoResponse.error });
        }
        else {
            res.locals.newPlace = postPhotoResponse.newPlace;
            res.locals.mensaje = "Foto enviada correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en el envio de foto: " + e.message);
    }
    finally {
        next();
    }
});
exports.postPhotoController = postPhotoController;
const deletePhotoController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photoId = req.params.photoId;
        const deletePhotoResponse = yield (0, sitiosService_1.deletePhotoService)(photoId);
        if (deletePhotoResponse.error) {
            res.status(deletePhotoResponse.status).send({ msg: deletePhotoResponse.error });
        }
        else {
            res.locals.newPlace = deletePhotoResponse.newPlace;
            res.locals.mensaje = "Foto eliminada correctamente";
            res.status(200);
        }
    }
    catch (e) {
        (0, error_handle_1.handleHttp)(res, "Error en la eliminacion de foto: " + e.message);
    }
    finally {
        next();
    }
});
exports.deletePhotoController = deletePhotoController;
