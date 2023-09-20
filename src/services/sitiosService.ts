import { ObjectId } from "mongodb";
import CommentType from "../interfaces/CommentType";
import { Site } from "../interfaces/Site";
import SitioModel from "../models/sitioModel";
import UsuarioModel from "../models/usuarioModel";
import { FisicaEnum, FisicaKey, PsiquicaEnum, PsiquicaKey, SensorialEnum, SensorialKey, Valoracion } from '../interfaces/Valoracion';
import ValoracionModel from "../models/valoracionModel";

const postCommentService = async (comment: { texto: string; usuarioId: string }, place: Site) => {

    const commentToInsert: CommentType = {
        _id: new ObjectId(),
        usuarioId: comment.usuarioId,
        texto: comment.texto,
        date: new Date(),
    };

    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: place.placeId },
        { $push: { comentarios: commentToInsert }, $setOnInsert: place },
        { upsert: true, new: true }
    );

    if (updateResult) {
        return { status: 200, newPlace: updateResult, comment: commentToInsert };
    } else {
        return { error: "No se pudo guardar el comentario", status: 500 };
    }

};



const editCommentService = async (placeId: string, commentId: string, newText: string) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: placeId, "comentarios._id": commentId },
        { $set: { "comentarios.$.texto": newText } },
        { new: true, rawResult: true }
    );

    if (updateResult.ok) {
        // Encuentra el comentario específico en la lista actualizada de comentarios.
        const editedComment = updateResult.value?.comentarios?.find(comment => comment._id.toString() === commentId);

        // Si el comentario no se encuentra (aunque esto es poco probable porque acaba de ser actualizado), devuelve un error.
        if (!editedComment) {
            return { error: "Error al recuperar el comentario editado", status: 500 };
        }

        return { status: 200, editedComment };
    } else if (updateResult.value === null) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
    } else {
        return { error: "No se pudo editar el comentario", status: 500 };
    }
};


const deleteCommentService = async (commentId: string, placeId: string) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: placeId },
        { $pull: { comentarios: { _id: commentId } } },
        { new: true, rawResult: true }
    );

    if (updateResult.ok) {
        return { status: 200, newPlace: updateResult };
    } else if (updateResult.value === null) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
    } else {
        return { error: "No se pudo eliminar el comentario", status: 500 };
    }
};

const getCommentsService = async (placeId: string) => {
    const siteFound = await SitioModel.findOne({ placeId: placeId });

    if (!siteFound) {
        return { comentarios: [] };
    } else {
        const siteFoundObj = siteFound.toObject();
        if (siteFoundObj.comentarios) {
            for (let i = 0; i < siteFoundObj.comentarios.length; i++) {
                const comment = siteFoundObj.comentarios[i];
                const user = await UsuarioModel.findOne({ _id: comment.usuarioId });

                if (user) {
                    delete siteFoundObj.comentarios[i].usuarioId;
                    siteFoundObj.comentarios[i].usuario = {
                        _id: user._id,
                        nombre: user.nombre,
                        apellidos: user.apellidos
                    };
                } else {
                    delete siteFoundObj.comentarios[i].usuarioId;
                    siteFoundObj.comentarios[i].usuario = {
                        _id: new ObjectId(comment.usuarioId),
                        nombre: "Usuario",
                        apellidos: "No Encontrado"
                    };
                }
            }
            return { comentarios: siteFoundObj.comentarios };
        } else
            return { comentarios: [] };
    }
}

const postReviewService = async (userId: string, place: Site, valoracion: Valoracion) => {
    //Insert new review in valoracionModel
    const newValoracion = { placeId: place.placeId, userId: userId, fisica: valoracion.fisica, sensorial: valoracion.sensorial, psiquica: valoracion.psiquica }
    const insertResult = await ValoracionModel.create(newValoracion);
    if (insertResult) {

        const newAveragesResult = await updateAverages(place);
        if (newAveragesResult && !newAveragesResult.error) {
            return { newPlace: newAveragesResult.newPlace };
        }
        else {
            return { error: "No se pudo actualizar el promedio", status: 500 };
        }
    } else {
        return { error: "No se pudo guardar la valoracion", status: 500 };
    }
}

const editReviewService = async (reviewId: string, valoracion: Valoracion) => {
    const editResult = await ValoracionModel.findOneAndUpdate(
        { _id: reviewId },
        { $set: { fisica: valoracion.fisica, sensorial: valoracion.sensorial, psiquica: valoracion.psiquica } },
        { new: true, rawResult: true }
    );

    if (editResult.ok && editResult.value) {
        const newAveragesResult = await updateAverages(editResult.value?.placeId);

        if (newAveragesResult && !newAveragesResult.error) {
            return { newPlace: newAveragesResult.newPlace, status: 200 };
        }
        else {
            return { error: "No se pudo actualizar el promedio", status: 500 };
        }
    } else {
        return { error: "No se pudo editar la valoracion", status: 500 };
    }
}

const deleteReviewService = async (reviewId: string) => {
    const deleteResult = await ValoracionModel.findByIdAndDelete(reviewId);

    if (deleteResult) {
        const newAveragesResult = await updateAverages(deleteResult.placeId);

        if (newAveragesResult && !newAveragesResult.error) {
            return { newPlace: newAveragesResult.newPlace, status: 200 };
        }
        else {
            return { error: "No se pudo actualizar el promedio", status: 500 };
        }
    } else {
        return { error: "No se pudo eliminar la valoracion", status: 500 };
    }
}

//Aux functions
const updateAverages = async (input: Site | string) => {
    let placeId: string;
    let place: Site | null = null;

    if (typeof input === "string") {
        placeId = input;
    } else {
        placeId = input.placeId;
        place = input;
    }

    // Find all reviews for placeId
    const reviews = await ValoracionModel.find({ placeId: placeId });

    if (reviews) {
        const averages = calculateAverages(reviews);

        // Parametros para actualizar el sitio
        const updateOptions: any = { $set: { valoraciones: averages } };
        if (place)
            updateOptions.$setOnInsert = place;

        const updateResult = await SitioModel.findOneAndUpdate(
            { placeId: placeId },
            updateOptions,
            { new: true }
        );

        if (updateResult)
            return { newPlace: updateResult.toObject() };
        else
            return { error: "No se pudo actualizar el promedio", status: 500 };
    } else {
        return { error: "No se pudo calcular el promedio", status: 500 };
    }
}


const calculateAverages = (reviews: Valoracion[]) => {
    let fisicaSum = {} as Record<FisicaKey, number>;
    let sensorialSum = {} as Record<SensorialKey, number>;
    let psiquicaSum = {} as Record<PsiquicaKey, number>;

    let fisicaCount = {} as Record<FisicaKey, number>;
    let sensorialCount = {} as Record<SensorialKey, number>;
    let psiquicaCount = {} as Record<PsiquicaKey, number>;

    // Initialize counts and sums to 0
    Object.values(FisicaEnum).forEach(key => {
        fisicaSum[key] = 0;
        fisicaCount[key] = 0;
    });
    Object.values(SensorialEnum).forEach(key => {
        sensorialSum[key] = 0;
        sensorialCount[key] = 0;
    });
    Object.values(PsiquicaEnum).forEach(key => {
        psiquicaSum[key] = 0;
        psiquicaCount[key] = 0;
    });

    for (const review of reviews) {
        for (const key of Object.values(FisicaEnum)) {
            if (review.fisica && review.fisica[key]) {
                fisicaSum[key] += review.fisica[key];
                fisicaCount[key]++;
            }
        }
        for (const key of Object.values(SensorialEnum)) {
            if (review.sensorial && review.sensorial[key]) {
                sensorialSum[key] += review.sensorial[key];
                sensorialCount[key]++;
            }
        }
        for (const key of Object.values(PsiquicaEnum)) {
            if (review.psiquica && review.psiquica[key]) {
                psiquicaSum[key] += review.psiquica[key];
                psiquicaCount[key]++;
            }
        }
    }

    const computeAverageForCategory = (
        sum: Record<string, number>,
        count: Record<string, number>
    ) => {
        let total = 0;
        const valoracion: Record<string, number> = {};

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

    return {
        ...(fisicaResult.average !== undefined ? { fisica: fisicaResult } : {}),
        ...(sensorialResult.average !== undefined ? { sensorial: sensorialResult } : {}),
        ...(psiquicaResult.average !== undefined ? { psiquica: psiquicaResult } : {})
    };
};

export {
    postCommentService,
    editCommentService,
    deleteCommentService,
    getCommentsService,
    postReviewService,
    editReviewService,
    deleteReviewService
}