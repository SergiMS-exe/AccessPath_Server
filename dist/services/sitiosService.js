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
exports.postPhotoService = exports.deleteReviewService = exports.editReviewService = exports.postReviewService = exports.getCommentsService = exports.deleteCommentService = exports.editCommentService = exports.postCommentService = exports.getClosePlacesService = void 0;
const mongodb_1 = require("mongodb");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const usuarioModel_1 = __importDefault(require("../models/usuarioModel"));
const Valoracion_1 = require("../interfaces/Valoracion");
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
const getClosePlacesService = (location, radius, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const closePlaces = yield sitioModel_1.default.find({
        $or: [
            { "valoraciones": { $exists: true, $ne: {} } },
            { "comentarios": { $exists: true, $ne: [] } }
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
// const postCommentService = async (comment: { texto: string; usuarioId: string }, place: Site) => {
//     const commentToInsert: CommentType = {
//         _id: new ObjectId(),
//         usuarioId: comment.usuarioId,
//         texto: comment.texto,
//         date: new Date(),
//     };
//     const placeConverted = transformToServerFormat(place);
//     const updateResult = await SitioModel.findOneAndUpdate(
//         { placeId: place.placeId },
//         { $push: { comentarios: commentToInsert }, $setOnInsert: placeConverted },
//         { upsert: true, new: true }
//     );
//     if (updateResult) {
//         return { status: 200, newPlace: updateResult, comment: commentToInsert };
//     } else {
//         return { error: "No se pudo guardar el comentario", status: 500 };
//     }
// };
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
            return { status: 200, newPlace: createdSite, comment: newComment };
        }
        // Si el sitio ya existe, simplemente añadimos el comentario al array de comentarios
        site.comentarios.push(newComment);
        yield site.save();
        return { status: 200, newPlace: site, comment: newComment };
    }
    catch (error) {
        console.error("Error al publicar comentario:", error); // Puedes registrar el error para futuras revisiones
        return { status: 500, error: "Error al guardar el comentario: " + error };
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
    const session = yield sitioModel_1.default.startSession();
    let response;
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            // Primero, elimina el comentario especificado
            const updateResult = yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId }, { $pull: { comentarios: { _id: commentId } } }, { new: true, session });
            if (updateResult) { // Si se hizo bien el primer update
                const isCommentsEmpty = updateResult.comentarios.length === 0;
                // Si el campo comentarios no existe o está vacío, elimina el campo comentarios.
                if (isCommentsEmpty) {
                    yield sitioModel_1.default.findOneAndUpdate({ placeId: placeId }, { $unset: { comentarios: 1 } }, { session });
                }
                response = { status: 200, newPlace: updateResult };
            }
            else {
                response = { error: "No hay un sitio registrado con ese placeId", status: 404 };
            }
        }));
    }
    catch (error) {
        response = { error: "No se pudo eliminar el comentario", status: 500 };
    }
    finally {
        yield session.endSession();
        return response;
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
const postPhotoService = (place, photo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Comprimimos la calidad de la foto
        // const compressedPhotoBuffer = await sharp(photo.fotoBuffer)
        //     .jpeg({ quality: 80 })  // Puedes ajustar la calidad según tus necesidades
        //     .toBuffer();
        // // Reemplazamos el buffer original de la foto con el buffer comprimido
        // photo.fotoBuffer = compressedPhotoBuffer;
        // Luego, el resto del código permanece igual...
        // Primero, buscamos el sitio usando el placeId
        const site = yield sitioModel_1.default.findOne({ placeId: place.placeId });
        // Si no encontramos el sitio, lo creamos
        if (!site) {
            const newSite = Object.assign(Object.assign({}, place), { fotos: [photo] });
            const createdSite = new sitioModel_1.default(newSite);
            yield createdSite.save();
            return { newPlace: createdSite };
        }
        // Si el sitio ya existe, simplemente añadimos la foto al array de fotos
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
//Aux functions
// const updateAverages = async (input: Site | string) => {
//     let placeId: string;
//     let place: Site | undefined = undefined;
//     if (typeof input === "string") {
//         placeId = input;
//     } else {
//         placeId = input.placeId;
//         place = input;
//     }
//     // Busca todas las valoraciones del sitio
//     const reviews = await ValoracionModel.find({ placeId: placeId });
//     const updateOptions: any = {};
//     if (!reviews)
//         return { error: "No se pudo actualizar el promedio", status: 500 };
//     if (reviews.length > 0) { // Si hay valoraciones, calcula los promedios y actualiza el campo valoraciones
//         const averages = calculateAverages(reviews);
//         updateOptions.$set = { valoraciones: averages };
//     } else { // Si no hay valoraciones, elimina el campo valoraciones
//         updateOptions.$unset = { valoraciones: 1 };
//     }
//     if (place) {
//         updateOptions.$setOnInsert = place;
//     }
//     const updateResult = await SitioModel.findOneAndUpdate(
//         { placeId: placeId },
//         updateOptions,
//         { new: true, upsert: true }
//     );
//     if (updateResult) {
//         return { newPlace: updateResult.toObject() };
//     } else {
//         return { error: "No se pudo actualizar el promedio", status: 500 };
//     }
// };
const updateAverages = (input) => __awaiter(void 0, void 0, void 0, function* () {
    let placeId;
    let place = undefined;
    if (typeof input === "string") {
        placeId = input;
    }
    else {
        placeId = input.placeId;
        place = input;
    }
    const siteFound = yield sitioModel_1.default.findOne({ placeId: placeId });
    // Busca todas las valoraciones del sitio
    const reviews = yield valoracionModel_1.default.find({ placeId: placeId });
    if (!reviews)
        return { error: "No se pudo actualizar el promedio", status: 500 };
    const averages = reviews.length > 0 ? calculateAverages(reviews) : undefined;
    if (!siteFound && averages) {
        if (!place)
            return { error: "No se proporcionó información sobre el sitio", status: 500 };
        const newSite = Object.assign(Object.assign({}, place), { valoraciones: averages });
        const createdSite = new sitioModel_1.default(newSite);
        yield createdSite.save();
        return { status: 200, newPlace: createdSite };
    }
    if (averages) {
        siteFound.valoraciones = averages;
    }
    else {
        delete siteFound.valoraciones;
    }
    yield siteFound.save();
    return { status: 200, newPlace: siteFound.toObject() };
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
