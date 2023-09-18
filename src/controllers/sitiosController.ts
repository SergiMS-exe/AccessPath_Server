import { NextFunction, Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { deleteCommentService, editCommentService, getCommentsService, postCommentService, postReviewService } from "../services/sitiosService";
import { Valoracion } from "../interfaces/Valoracion";
import { Site } from "../interfaces/Site";

const sitesIndexController = (req: Request, res: Response, next: NextFunction) => {
    res.json({
        availableSubendpoints: [
            {
                path: "/comments",
                method: "GET"
            },
            {
                path: "/comment",
                method: "POST",
                body: ["content", "author"]
            },
            {
                path: "/comment/:placeId",
                method: "PUT",
                params: ["placeId"],
                body: ["content"]
            },
            {
                path: "/comment/:placeId/:commentId",
                method: "DELETE",
                params: ["placeId", "commentId"]
            }
        ]
    });
};

const getNearPlaces = () => { }

const postCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.comment || !req.body.site || !req.body.comment.usuarioId || !req.body.comment.texto || req.body.comment.texto.trim().length < 1) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const postCommentResponse = await postCommentService(req.body.comment, req.body.site);

        if (postCommentResponse.error) {
            res.status(postCommentResponse.status).send({ msg: postCommentResponse.error });
        } else {
            res.status(200).send({ msg: "Comentario enviado correctamente", comment: postCommentResponse.comment });
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

            res.send({ msg: "Comentario editado correctamente", newComment: editCommentResponse.editedComment })
        }
    } catch (e) {
        handleHttp(res, "Error en la edicion de comentario: " + e)
    } finally {
        next()
    }
}

const deleteCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commentId, placeId } = req.params
        if (!placeId || !commentId) {
            return handleHttp(res, "Faltan datos en los parametros", 400)
        }
        const deleteCommentResponse = await deleteCommentService(commentId as string, placeId as string);

        if (deleteCommentResponse.error) {
            res.status(deleteCommentResponse.status).send({ msg: deleteCommentResponse.error })
        } else {
            res.status(200).send({ msg: "Comentario eliminado correctamente" })
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

        // if (getCommentsResponse.error) {
        //     res.status(getCommentsResponse.status).send({ msg: getCommentsResponse.error })
        // } else {
        res.status(200).send({ msg: "Comentarios obtenidos correctamente", comentarios: getCommentsResponse.comentarios })
        // }
    } catch (e) {
        handleHttp(res, "Error en la obtencion de comentarios: " + e)
    } finally {
        next()
    }
}

const postReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.review || !req.body.place || !req.body.usuarioId) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const usuarioId: string = req.body.usuarioId;
        const place: Site = req.body.place;
        const review: Valoracion = req.body.review;

        const postReviewResponse = await postReviewService(usuarioId, place, review);

        if (postReviewResponse.error) {
            res.status(postReviewResponse.status).send({ msg: postReviewResponse.error });
        } else {
            res.status(200).send({ msg: "Valoracion enviada correctamente", review: postReviewResponse.averages });
        }
    } catch (e) {
        handleHttp(res, "Error en el envio de valoracion: " + e)
    } finally {
        next()
    }
}

export {
    sitesIndexController,
    getNearPlaces,
    postCommentController,
    editCommentController,
    deleteCommentController,
    getCommentsController,
    postReviewController
}