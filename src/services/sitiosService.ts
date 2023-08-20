import { ObjectId } from "mongodb";
import CommentType from "../interfaces/CommentType";
import { Site } from "../interfaces/Site";
import SitioModel from "../models/sitioModel";
import UsuarioModel from "../models/usuarioModel";

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
                    return { error: "Usuario no encontrado para el comentario", status: 500 };
                }
            }
            return { comentarios: siteFoundObj.comentarios };
        } else
            return { comentarios: [] };
    }
}

export {
    postCommentService,
    editCommentService,
    deleteCommentService,
    getCommentsService
}