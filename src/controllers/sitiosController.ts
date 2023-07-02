import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { deleteCommentService, editCommentService, postCommentService } from "../services/sitiosService";

const getNearPlaces = () => { }

const postCommentController = async (req: Request, res: Response) => {
    try {
        const postCommentResponse = await postCommentService(req.body.comment, req.body.placeId);

        if (postCommentResponse.error) {
            res.status(postCommentResponse.status).send({ msg: postCommentResponse.error })
        } else {
            const comment = postCommentResponse.newPlace?.comments?.find(comment => comment.userId === req.body.comment.userId)
            res.send({ msg: "Comentario enviado correctamente", comment })
        }
    } catch (e) {
        handleHttp(res, "Error en el envio de comentario: " + e)
    }
}

const editCommentController = async (req: Request, res: Response) => {
    try {
        const editCommentResponse = await editCommentService(req.body.comment, req.body.placeId);

        if (editCommentResponse.error) {
            res.status(editCommentResponse.status).send({ msg: editCommentResponse.error })
        } else {
            const comment = editCommentResponse.newPlace?.comments?.find(comment => comment.userId === req.body.comment.userId)
            res.send({ msg: "Comentario editado correctamente", comment })
        }
    } catch (e) {
        handleHttp(res, "Error en la edicion de comentario: " + e)
    }
}

const deleteCommentController = async (req: Request, res: Response) => {
    try {
        const deleteCommentResponse = await deleteCommentService(req.body.comment, req.body.placeId);

        if (deleteCommentResponse.error) {
            res.status(deleteCommentResponse.status).send({ msg: deleteCommentResponse.error })
        } else {
            res.send({ msg: "Comentario eliminado correctamente", comment: req.body.comment })
        }
    } catch (e) {
        handleHttp(res, "Error en la eliminacion de comentario: " + e)
    }
}

export {
    getNearPlaces,
    postCommentController,
    editCommentController,
    deleteCommentController
}