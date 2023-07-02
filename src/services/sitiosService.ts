import CommentType from "../interfaces/CommentType"
import Site from "../interfaces/Site";
import SitioModel from "../models/sitioModel";

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



const editCommentService = async (comment: CommentType, placeId: string) => {
    const updateResult = await SitioModel.findOneAndUpdate(
        { placeId: placeId, "comments._id": comment._id },
        { $set: { "comments.$.texto": comment.texto } },
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

export {
    postCommentService,
    editCommentService,
    deleteCommentService
}