import { NextFunction, Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { deleteCommentService, deleteReviewService, editCommentService, editReviewService, getClosePlacesService, getCommentsService, postCommentService, postPhotoService, postReviewService } from "../services/sitiosService";
import { Valoracion } from "../interfaces/Valoracion";
import { Photo, Site, SiteLocation } from "../interfaces/Site";

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

const getClosePlacesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query.location)
            handleHttp(res, "Faltan datos en los parametros", 400);
        else if (typeof req.query.location !== "string" || !req.query.location.includes('%'))
            handleHttp(res, "El formato de la ubicacion es incorrecto", 400);

        const location: SiteLocation = {
            latitude: parseFloat((req.query.location as string).split('%')[0]),
            longitude: parseFloat((req.query.location as string).split('%')[1])
        };

        const radius = req.query.radius ? parseInt(req.query.radius as string) : 50000; // 50km
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;

        const closePlacesResponse = await getClosePlacesService(location, radius, limit);

        if (closePlacesResponse.error) {
            res.status(closePlacesResponse.status).send({ msg: closePlacesResponse.error });
        } else {
            res.locals.sitios = closePlacesResponse.sitios;
            res.locals.mensaje = "Sitios cercanos obtenidos correctamente";
        }
    } catch (e) {
        handleHttp(res, "Error en la obtencion de sitios cercanos: " + e)
    } finally {
        next()
    }
}

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

        if (deleteCommentResponse!.error) {
            res.status(deleteCommentResponse!.status).send({ msg: deleteCommentResponse!.error })
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
            res.locals.newPlace = postReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion enviada correctamente";
            //res.status(200).send({ msg: "Valoracion enviada correctamente", newPlace: postReviewResponse.newPlace });
        }
    } catch (e) {
        handleHttp(res, "Error en el envio de valoracion: " + e)
    } finally {
        next()
    }
}

const editReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.review) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const review: Valoracion = req.body.review;
        const reviewId: string = req.params.reviewId;

        const editReviewResponse = await editReviewService(reviewId, review);
        if (editReviewResponse.error) {
            res.status(editReviewResponse.status).send({ msg: editReviewResponse.error })
        } else {
            res.locals.newPlace = editReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion editada correctamente";
            //res.status(200).send({ msg: "Valoracion editada correctamente", newPlace: editReviewResponse.newPlace })
        }
    } catch (e) {
        handleHttp(res, "Error en la edicion de valoracion: " + e)
    } finally {
        next()
    }
}

const deleteReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviewId: string = req.params.reviewId;

        const deleteReviewResponse = await deleteReviewService(reviewId);
        if (deleteReviewResponse.error) {
            res.status(deleteReviewResponse.status).send({ msg: deleteReviewResponse.error })
        } else {
            res.locals.newPlace = deleteReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion eliminada correctamente";
            //res.status(200).send({ msg: "Valoracion eliminada correctamente", newPlace: deleteReviewResponse.newPlace })
        }
    } catch (e) {
        handleHttp(res, "Error en la eliminacion de valoracion: " + e)
    } finally {
        next()
    }
}

const postPhotoController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { photo, site }: { photo: Photo, site: Site | string } = req.body;

        if (!photo || !site || !photo.base64 || !photo.usuarioId || !photo.alternativeText) {
            return handleHttp(res, "Faltan datos en el body", 400);
        }

        const parsedSite: Site = typeof site === "string" ? JSON.parse(site) : site;

        const postPhotoResponse = await postPhotoService(parsedSite, photo);
        if (postPhotoResponse.error) {
            res.status(postPhotoResponse.status).send({ msg: postPhotoResponse.error })
        } else {
            res.locals.newPlace = postPhotoResponse.newPlace;
            res.locals.mensaje = "Foto enviada correctamente";
        }
    } catch (e) {
        handleHttp(res, "Error en el envio de foto: " + e)
    } finally {
        next()
    }
}

export {
    sitesIndexController,
    getClosePlacesController,
    postCommentController,
    editCommentController,
    deleteCommentController,
    getCommentsController,
    postReviewController,
    editReviewController,
    deleteReviewController,
    postPhotoController
}