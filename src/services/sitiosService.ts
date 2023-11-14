import { ObjectId } from "mongodb";
import { Photo, Site, SiteLocation } from "../interfaces/Site";
import SitioModel from "../models/sitioModel";
import UsuarioModel from "../models/usuarioModel";
import { FisicaEnum, FisicaKey, PsiquicaEnum, PsiquicaKey, SensorialEnum, SensorialKey, Valoracion } from '../interfaces/Valoracion';
import ValoracionModel from "../models/valoracionModel";
import { handleFindSitesByTextGoogle } from "../utils/google.handle";
import { updateAverages } from "../utils/auxiliar.handle";


const getClosePlacesService = async (location: SiteLocation, radius: number, limit: number) => {
    const closePlaces = await SitioModel.find({
        $or: [
            { "valoraciones": { $exists: true, $ne: {} } },
            { "comentarios": { $exists: true, $ne: [] } },
            { "fotos": { $exists: true, $ne: [] } }
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
    } else {
        return { error: "No se pudo encontrar ningun lugar cercano", status: 404 };
    }
}

const getPlacesByTextService = async (text: string) => {
    let sitesFromGooglePlaces: Site[] = [];
    let sitesFromDB: Site[] = [];

    try {
        sitesFromGooglePlaces = await handleFindSitesByTextGoogle(text);
    } catch (error: any) {
        return { error: "Error al buscar sitios en Google Places: " + error.message, status: 500 };
    }

    try {
        sitesFromDB = await SitioModel.find({ placeId: { $in: sitesFromGooglePlaces.map(site => site.placeId) } });
    } catch (error: any) {
        return { error: "Error al buscar sitios en la base de datos: " + error.message, status: 500 };
    }

    if (sitesFromDB.length > 0) {
        sitesFromGooglePlaces.forEach((siteFromGooglePlaces, index) => {
            const siteFromDB = sitesFromDB.find(site => site.placeId === siteFromGooglePlaces.placeId);
            if (siteFromDB) {
                sitesFromGooglePlaces[index] = siteFromDB;
            }
        });
    }

    return { sitios: sitesFromGooglePlaces };
}

//Fotos-------------------------------------------------------------------------------------------
const postCommentService = async (comment: { texto: string; usuarioId: string }, place: Site) => {
    try {
        // Primero, buscamos el sitio usando el placeId
        const site = await SitioModel.findOne({ placeId: place.placeId });

        // Creamos un nuevo comentario con los datos proporcionados
        const newComment = {
            _id: new ObjectId(),
            date: new Date(),
            texto: comment.texto,
            usuarioId: comment.usuarioId
        };

        // Si no encontramos el sitio, lo creamos
        if (!site) {
            const newSite: Site = {
                ...place, // Aquí copiamos todas las propiedades de place
                comentarios: [newComment] // Inicializamos el array de comentarios con el comentario proporcionado
            };
            const createdSite = new SitioModel(newSite);
            await createdSite.save();
            return { status: 200, newPlace: newSite, comment: newComment };
        }

        // Si el sitio ya existe, simplemente añadimos el comentario al array de comentarios
        if (!site.comentarios) site.comentarios = []; // Si el campo comentarios no existe, lo inicializamos como un array vacío
        site.comentarios.push(newComment);
        await site.save();

        return { status: 200, newPlace: site, comment: newComment };
    } catch (error: any) {
        console.error("Error al publicar comentario:", error.message); // Puedes registrar el error para futuras revisiones
        return { status: 500, error: "Error al guardar el comentario: " + error.message };
    }
};

const editCommentService = async (placeId: string, commentId: string, newText: string) => {
    try {
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
    } catch (error: any) {
        console.error("Error al editar el comentario:", error.message);
        return { error: "Error al editar el comentario: " + error.message, status: 500 };
    }
};

const deleteCommentService = async (commentId: string, placeId: string) => {
    try {
        const response = await SitioModel.findOneAndUpdate(
            { placeId: placeId },
            { $pull: { comentarios: { _id: commentId } } },
            { new: true }
        );

        if (response) {
            return { newPlace: response };
        } else {
            return { error: "No se pudo eliminar el comentario", status: 500 };
        }
    } catch (error) {
        console.error("Error al eliminar el comentario:", error);
        return { error: "No se pudo eliminar el comentario", status: 500 };
    }
}

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

//Valoraciones----------------------------------------------------------------------------------------
const postReviewService = async (userId: string, place: Site, valoracion: Valoracion) => {
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

const editReviewService = async (placeId: string, userId: string, valoracion: Valoracion) => {
    try {
        const editResult = await ValoracionModel.findOneAndUpdate(
            { placeId: placeId, userId: userId },
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
    } catch (error: any) {
        console.error("Error al editar la valoracion:", error.message);
        return { error: "Error al editar la valoracion: " + error.message, status: 500 };
    }
}

const deleteReviewService = async (placeId: string, userId: string) => {
    try {
        //delete from userId and placeId
        const deleteResult = await ValoracionModel.findOneAndDelete({ placeId: placeId, userId: userId });

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
    } catch (error: any) {
        console.error("Error al eliminar la valoracion:", error.message);
        return { error: "Error al eliminar la valoracion: " + error.message, status: 500 };
    }
}

//Fotos-------------------------------------------------------------------------------------------
const postPhotoService = async (place: Site, photo: Photo) => {
    try {
        const site = await SitioModel.findOne({ placeId: place.placeId });

        // Si no encontramos el sitio, lo creamos
        if (!site) {
            const newSite: Site = {
                ...place,
                fotos: [photo]
            };
            const createdSite = new SitioModel(newSite);
            await createdSite.save();
            return { newPlace: createdSite };
        }

        // Si el sitio ya existe, simplemente añadimos la foto al array de fotos
        site.fotos!.push(photo);
        await site.save();

        return { newPlace: site };
    } catch (error) {
        console.error("Error al enviar la foto:", error);
        return { error: "No se pudo guardar la foto", status: 500 };
    }
};

const deletePhotoService = async (photoId: string) => {
    try {
        const response = await SitioModel.findOneAndUpdate(
            { "fotos._id": photoId },
            { $pull: { fotos: { _id: photoId } } },
            { new: true, rawResult: true }
        );

        if (response.ok) {
            return { newPlace: response.value };
        } else {
            return { error: "No se pudo eliminar la foto", status: 500 };
        }
    } catch (error) {
        console.error("Error al eliminar la foto:", error);
        return { error: "No se pudo eliminar la foto", status: 500 };
    }
}

//Aux functions



export {
    getClosePlacesService,
    getPlacesByTextService,
    postCommentService,
    editCommentService,
    deleteCommentService,
    getCommentsService,
    postReviewService,
    editReviewService,
    deleteReviewService,
    postPhotoService,
    deletePhotoService
}