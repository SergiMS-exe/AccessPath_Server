import { NextFunction, Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { deleteCommentService, editCommentService, getCommentsService, postCommentService } from "../services/sitiosService";

const getNearPlaces = () => { }

const postCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.comment || !req.body.placeId || !req.body.comment.userId || !req.body.comment.text || req.body.comment.text.trim().length < 1) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const postCommentResponse = await postCommentService(req.body.comment, req.body.placeId);

        if (postCommentResponse.error) {
            res.status(postCommentResponse.status).send({ msg: postCommentResponse.error })
        } else {
            const comment = postCommentResponse.newPlace?.comentarios?.find(comment => comment.usuarioId === req.body.comment.userId)
            res.status(200).send({ msg: "Comentario enviado correctamente", comment })
        }
    } catch (e) {
        handleHttp(res, "Error en el envio de comentario: " + e)
    } finally {
        next()
    }
}

const editCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.placeId) {
            return handleHttp(res, "Faltan datos en los parametros", 400)
        }
        const { commentId, newText } = req.body
        if (!commentId || !newText || newText.trim().length < 1) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const editCommentResponse = await editCommentService(req.params.placeId, commentId, newText);

        if (editCommentResponse.error) {
            res.status(editCommentResponse.status).send({ msg: editCommentResponse.error })
        } else {
            const comment = editCommentResponse.newPlace?.comentarios?.find(comment => comment.usuarioId === req.body.comment.userId)
            res.send({ msg: "Comentario editado correctamente", comment })
        }
    } catch (e) {
        handleHttp(res, "Error en la edicion de comentario: " + e)
    } finally {
        next()
    }
}

const deleteCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.placeId || !req.params.commentId) {
            return handleHttp(res, "Faltan datos en los parametros", 400)
        }

        const deleteCommentResponse = await deleteCommentService(req.params.commentId, req.params.placeId);

        if (deleteCommentResponse.error) {
            res.status(deleteCommentResponse.status).send({ msg: deleteCommentResponse.error })
        } else {
            res.status(200).send({ msg: "Comentario eliminado correctamente", comment: req.body.comment })
        }
    } catch (e) {
        handleHttp(res, "Error en la eliminacion de comentario: " + e)
    } finally {
        next()
    }
}

const getCommentsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const placeId = req.query.placeId;
        if (!placeId) {
            return handleHttp(res, "Faltan datos en los parametros", 400)
        }
        const getCommentsResponse = await getCommentsService(placeId as string);
        console.log(getCommentsResponse)

        if (getCommentsResponse.error) {
            res.status(getCommentsResponse.status).send({ msg: getCommentsResponse.error })
        } else {
            res.status(200).send({ msg: "Comentarios obtenidos correctamente", comentarios: getCommentsResponse.comentarios })
        }
    } catch (e) {
        handleHttp(res, "Error en la obtencion de comentarios: " + e)
    } finally {
        next()
    }
}
export {
    getNearPlaces,
    postCommentController,
    editCommentController,
    deleteCommentController,
    getCommentsController
}