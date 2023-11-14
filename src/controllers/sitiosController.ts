import { NextFunction, Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { deleteCommentService, deletePhotoService, deleteReviewService, editCommentService, editReviewService, getClosePlacesService, getCommentsService, getPlacesByTextService, postCommentService, postPhotoService, postReviewService } from "../services/sitiosService";
import { Valoracion } from "../interfaces/Valoracion";
import { Photo, Site, SiteLocation } from "../interfaces/Site";
import { ObjectId } from "mongodb";

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
            handleHttp(res, "Faltan datos en la query", 400);
        else if (typeof req.query.location !== "string" || !req.query.location.includes('%'))
            handleHttp(res, "El formato de la ubicacion es incorrecto", 400);

        const location: SiteLocation = {
            latitude: parseFloat((req.query.location as string).split('%')[0]),
            longitude: parseFloat((req.query.location as string).split('%')[1])
        };

        const radius = req.query.radius ? parseInt(req.query.radius as string) : 100000; // 100km
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;

        const closePlacesResponse = await getClosePlacesService(location, radius, limit);

        if (closePlacesResponse.error) {
            res.status(closePlacesResponse.status).send({ msg: closePlacesResponse.error });
        } else {
            res.locals.sitios = closePlacesResponse.sitios;
            res.locals.mensaje = "Sitios cercanos obtenidos correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en la obtencion de sitios cercanos: " + e.message)
    } finally {
        next()
    }
}

const getPlacesByTextController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var text = req.query.text;
        if (!text) {
            return handleHttp(res, "Faltan datos en la query", 400)
        } else if (typeof text !== "string") {
            return handleHttp(res, "El formato del texto es incorrecto", 400)
        }

        const getPlacesByTextResponse = await getPlacesByTextService(text);

        if (getPlacesByTextResponse.error) {
            res.status(getPlacesByTextResponse.status).send({ msg: getPlacesByTextResponse.error });
        } else {
            res.locals.sitios = getPlacesByTextResponse.sitios;
            res.locals.mensaje = "Sitios obtenidos correctamente";
            res.status(200);
        }

    } catch (e: any) {
        handleHttp(res, "Error en la obtencion de sitios por texto: " + e.message)
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

    } catch (e: any) {
        handleHttp(res, "Error en el envio de comentario: " + e.message)
    } finally {
        next()
    }
}

const editCommentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commentId, newText } = req.body
        if (!commentId || !newText || newText.trim().length < 1) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const editCommentResponse = await editCommentService(req.params.placeId, commentId, newText);
        if (editCommentResponse.error) {
            res.status(editCommentResponse.status).send({ msg: editCommentResponse.error })
        } else {

            res.status(200).send({ msg: "Comentario editado correctamente", newComment: editCommentResponse.editedComment })
        }
    } catch (e: any) {
        handleHttp(res, "Error en la edicion de comentario: " + e.message)
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
    } catch (e: any) {
        handleHttp(res, "Error en la eliminacion de comentario: " + e.message)
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


        res.status(200).send({ msg: "Comentarios obtenidos correctamente", comentarios: getCommentsResponse.comentarios })

    } catch (e: any) {
        handleHttp(res, "Error en la obtencion de comentarios: " + e.message)
    } finally {
        next()
    }
}

const postReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.review || !req.body.site || !req.body.usuarioId || Object.keys(req.body.review).length === 0) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const usuarioId: string = req.body.usuarioId;
        const place: Site = req.body.site;
        const review: Valoracion = req.body.review;

        const postReviewResponse = await postReviewService(usuarioId, place, review);

        if (postReviewResponse.error) {
            res.status(postReviewResponse.status).send({ msg: postReviewResponse.error });
        } else {
            res.locals.newPlace = postReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion enviada correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en el envio de valoracion: " + e.message)
    } finally {
        next()
    }
}

const editReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.review || Object.keys(req.body.review).length === 0) {
            return handleHttp(res, "Faltan datos en el body", 400)
        }

        const review: Valoracion = req.body.review;
        const placeId: string = req.params.placeId;
        const userId: string = req.params.userId;

        const editReviewResponse = await editReviewService(placeId, userId, review);
        if (editReviewResponse.error) {
            res.status(editReviewResponse.status).send({ msg: editReviewResponse.error })
        } else {
            res.locals.newPlace = editReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion editada correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en la edicion de valoracion: " + e.message)
    } finally {
        next()
    }
}

const deleteReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const placeId: string = req.params.placeId;
        const userId: string = req.params.userId;

        const deleteReviewResponse = await deleteReviewService(placeId, userId);
        if (deleteReviewResponse.error) {
            res.status(deleteReviewResponse.status).send({ msg: deleteReviewResponse.error })
        } else {
            res.locals.newPlace = deleteReviewResponse.newPlace;
            res.locals.mensaje = "Valoracion eliminada correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en la eliminacion de valoracion: " + e.message)
    } finally {
        next()
    }
}

const postPhotoController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { photo, site }: { photo: any, site: Site | string } = req.body;

        if (!photo || !site || !photo.base64 || !photo.usuarioId || !photo.alternativeText) {
            return handleHttp(res, "Faltan datos en el body", 400);
        }

        const photoWithId: Photo = { ...photo, _id: new ObjectId() };

        const parsedSite: Site = typeof site === "string" ? JSON.parse(site) : site;

        const postPhotoResponse = await postPhotoService(parsedSite, photoWithId);
        if (postPhotoResponse.error) {
            res.status(postPhotoResponse.status).send({ msg: postPhotoResponse.error })
        } else {
            res.locals.newPlace = postPhotoResponse.newPlace;
            res.locals.mensaje = "Foto enviada correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en el envio de foto: " + e.message)
    } finally {
        next()
    }
}

const deletePhotoController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoId: string = req.params.photoId;

        const deletePhotoResponse = await deletePhotoService(photoId);
        if (deletePhotoResponse.error) {
            res.status(deletePhotoResponse.status).send({ msg: deletePhotoResponse.error })
        } else {
            res.locals.newPlace = deletePhotoResponse.newPlace;
            res.locals.mensaje = "Foto eliminada correctamente";
            res.status(200);
        }
    } catch (e: any) {
        handleHttp(res, "Error en la eliminacion de foto: " + e.message)
    } finally {
        next()
    }
}

export {
    sitesIndexController,
    getClosePlacesController,
    getPlacesByTextController,
    postCommentController,
    editCommentController,
    deleteCommentController,
    getCommentsController,
    postReviewController,
    editReviewController,
    deleteReviewController,
    postPhotoController,
    deletePhotoController
}