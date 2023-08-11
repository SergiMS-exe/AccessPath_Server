import CommentType from "../interfaces/CommentType"
import Site from "../interfaces/Site";
import SitioModel from "../models/sitioModel";
import UsuarioModel from "../models/usuarioModel";
import { ObjectId } from 'mongodb';

const postCommentService = async (comment: CommentType, place: Site) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: place.placeId },
        { $push: { comments: comment }, $setOnInsert: place },
        { upsert: true, new: true }
    );

    if (updateResult) {
        return { status: 200, newPlace: updateResult };
    } else {
        return { error: "No se pudo guardar el comentario", status: 500 };
    }
};



const editCommentService = async (placeId: string, commentId: string, newText: string) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: placeId, "comments._id": commentId },
        { $set: { "comments.$.texto": newText } },
        { new: true }
    );

    if (!updateResult) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
    } else if (updateResult.isModified()) {
        return { status: 200, newPlace: updateResult };
    } else {
        return { error: "No se pudo editar el comentario", status: 500 };
    }
};


const deleteCommentService = async (commentId: string, placeId: string) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: placeId },
        { $pull: { comments: { _id: commentId } } },
        { new: true }
    );

    if (!updateResult) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
    } else if (updateResult.isModified()) {
        return { status: 200, newPlace: updateResult };
    } else {
        return { error: "No se pudo eliminar el comentario", status: 500 };
    }
};

const getCommentsService = async (placeId: string) => {
    const siteFound = await SitioModel.findOne({ placeId: placeId });

    if (!siteFound) {
        return { error: "No hay un sitio registrado con ese placeId", status: 404 };
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
                    console.log("no user found");
                }
            }
        }
        return { comentarios: siteFoundObj.comentarios };
    }
}

export {
    postCommentService,
    editCommentService,
    deleteCommentService,
    getCommentsService
}