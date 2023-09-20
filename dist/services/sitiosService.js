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
exports.deleteReviewService = exports.editReviewService = exports.postReviewService = exports.getCommentsService = exports.deleteCommentService = exports.editCommentService = exports.postCommentService = void 0;
const mongodb_1 = require("mongodb");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const Valoracion_1 = require("../interfaces/Valoracion");
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
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
const postReviewService = (userId, place, valoracion) => __awaiter(void 0, void 0, void 0, function* () {
    //Insert new review in valoracionModel
    const newValoracion = { placeId: place.placeId, userId: userId, fisica: valoracion.fisica, sensorial: valoracion.sensorial, psiquica: valoracion.psiquica };
    const insertResult = yield valoracionModel_1.default.create(newValoracion);
    if (insertResult) {
        const newAveragesResult = yield updateAverages(place);
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
const editReviewService = (reviewId, valoracion) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const editResult = yield valoracionModel_1.default.findOneAndUpdate({ _id: reviewId }, { $set: { fisica: valoracion.fisica, sensorial: valoracion.sensorial, psiquica: valoracion.psiquica } }, { new: true, rawResult: true });
    if (editResult.ok && editResult.value) {
        const newAveragesResult = yield updateAverages((_c = editResult.value) === null || _c === void 0 ? void 0 : _c.placeId);
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
});
exports.editReviewService = editReviewService;
const deleteReviewService = (reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteResult = yield valoracionModel_1.default.findByIdAndDelete(reviewId);
    if (deleteResult) {
        const newAveragesResult = yield updateAverages(deleteResult.placeId);
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
});
exports.deleteReviewService = deleteReviewService;
//Aux functions
const updateAverages = (input) => __awaiter(void 0, void 0, void 0, function* () {
    let placeId;
    let place = null;
    if (typeof input === "string") {
        placeId = input;
    }
    else {
        placeId = input.placeId;
        place = input;
    }
    // Find all reviews for placeId
    const reviews = yield valoracionModel_1.default.find({ placeId: placeId });
    if (reviews) {
        const averages = calculateAverages(reviews);
        // Parametros para actualizar el sitio
        const updateOptions = { $set: { valoraciones: averages } };
        if (place)
            updateOptions.$setOnInsert = place;
        const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId }, updateOptions, { new: true });
        if (updateResult)
            return { newPlace: updateResult.toObject() };
        else
            return { error: "No se pudo actualizar el promedio", status: 500 };
    }
    else {
        return { error: "No se pudo calcular el promedio", status: 500 };
    }
});
const calculateAverages = (reviews) => {
    let fisicaSum = {};
    let sensorialSum = {};
    let psiquicaSum = {};
    let fisicaCount = {};
    let sensorialCount = {};
    let psiquicaCount = {};
    // Initialize counts and sums to 0
    Object.values(Valoracion_1.FisicaEnum).forEach(key => {
        fisicaSum[key] = 0;
        fisicaCount[key] = 0;
    });
    Object.values(Valoracion_1.SensorialEnum).forEach(key => {
        sensorialSum[key] = 0;
        sensorialCount[key] = 0;
    });
    Object.values(Valoracion_1.PsiquicaEnum).forEach(key => {
        psiquicaSum[key] = 0;
        psiquicaCount[key] = 0;
    });
    for (const review of reviews) {
        for (const key of Object.values(Valoracion_1.FisicaEnum)) {
            if (review.fisica && review.fisica[key]) {
                fisicaSum[key] += review.fisica[key];
                fisicaCount[key]++;
            }
        }
        for (const key of Object.values(Valoracion_1.SensorialEnum)) {
            if (review.sensorial && review.sensorial[key]) {
                sensorialSum[key] += review.sensorial[key];
                sensorialCount[key]++;
            }
        }
        for (const key of Object.values(Valoracion_1.PsiquicaEnum)) {
            if (review.psiquica && review.psiquica[key]) {
                psiquicaSum[key] += review.psiquica[key];
                psiquicaCount[key]++;
            }
        }
    }
    const computeAverageForCategory = (sum, count) => {
        let total = 0;
        const valoracion = {};
        let fieldsWithValue = 0;
        for (const key in sum) {
            const averageForKey = count[key] > 0 ? sum[key] / count[key] : 0;
            if (averageForKey > 0) {
                valoracion[key] = averageForKey;
                total += valoracion[key];
                fieldsWithValue++;
            }
        }
        const average = fieldsWithValue > 0 ? total / fieldsWithValue : undefined;
        return { valoracion, average };
    };
    const fisicaResult = computeAverageForCategory(fisicaSum, fisicaCount);
    const sensorialResult = computeAverageForCategory(sensorialSum, sensorialCount);
    const psiquicaResult = computeAverageForCategory(psiquicaSum, psiquicaCount);
    return Object.assign(Object.assign(Object.assign({}, (fisicaResult.average !== undefined ? { fisica: fisicaResult } : {})), (sensorialResult.average !== undefined ? { sensorial: sensorialResult } : {})), (psiquicaResult.average !== undefined ? { psiquica: psiquicaResult } : {}));
};
