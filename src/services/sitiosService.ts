import { ObjectId } from "mongodb";
import { Photo, Site, SiteLocation } from "../interfaces/Site";
import SitioModel from "../models/sitioModel";
import UsuarioModel from "../models/usuarioModel";
import { FisicaEnum, FisicaKey, PsiquicaEnum, PsiquicaKey, SensorialEnum, SensorialKey, Valoracion } from '../interfaces/Valoracion';
import ValoracionModel from "../models/valoracionModel";
import { handleFindSitesByTextGoogle } from "../utils/google.handle";


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
    let sitesFromGooglePlaces: Site[];
    let sitesFromDB: Site[];

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
            return { status: 200, newPlace: createdSite, comment: newComment };
        }

        // Si el sitio ya existe, simplemente añadimos el comentario al array de comentarios
        site.comentarios!.push(newComment);
        await site.save();

        return { status: 200, newPlace: site, comment: newComment };
    } catch (error) {
        console.error("Error al publicar comentario:", error); // Puedes registrar el error para futuras revisiones
        return { status: 500, error: "Error al guardar el comentario: " + error };
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
    const session = await SitioModel.startSession();
    let response;
    try {
        await session.withTransaction(async () => {
            // Primero, elimina el comentario especificado
            const updateResult = await SitioModel.findOneAndUpdate(
                { placeId: placeId },
                { $pull: { comentarios: { _id: commentId } } },
                { new: true, session }
            );

            if (updateResult) { // Si se hizo bien el primer update
                const isCommentsEmpty = updateResult.comentarios!.length === 0;

                // Si el campo comentarios no existe o está vacío, elimina el campo comentarios.
                if (isCommentsEmpty) {
                    await SitioModel.findOneAndUpdate(
                        { placeId: placeId },
                        { $unset: { comentarios: 1 } },
                        { session }
                    );
                }

                response = { status: 200, newPlace: updateResult };
            } else {
                response = { error: "No hay un sitio registrado con ese placeId", status: 404 };
            }
        });
    } catch (error) {
        response = { error: "No se pudo eliminar el comentario", status: 500 };
    } finally {
        await session.endSession();
        return response;
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

//Valoraciones----------------------------------------------------------------------------------------
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

const updateAverages = async (input: Site | string) => {
    let placeId: string;
    let place: Site | undefined = undefined;

    if (typeof input === "string") {
        placeId = input;
    } else {
        placeId = input.placeId;
        place = input;
    }

    const siteFound = await SitioModel.findOne({ placeId: placeId });

    // Busca todas las valoraciones del sitio
    const reviews = await ValoracionModel.find({ placeId: placeId });

    if (!reviews)
        return { error: "No se pudo actualizar el promedio", status: 500 };

    const averages = reviews.length > 0 ? calculateAverages(reviews) : undefined;


    if (!siteFound && averages) {
        if (!place)
            return { error: "No se proporcionó información sobre el sitio", status: 500 };

        const newSite: Site = {
            ...place,
            valoraciones: averages as Valoracion
        };

        const createdSite = new SitioModel(newSite);
        await createdSite.save();
        return { status: 200, newPlace: createdSite };
    }
    if (averages) {
        siteFound!.valoraciones = averages as Valoracion;
    } else {
        delete siteFound!.valoraciones;
    }

    await siteFound!.save();
    return { status: 200, newPlace: siteFound!.toObject() };

};

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
                valoracion[key] = parseFloat(averageForKey.toFixed(1));
                total += valoracion[key];
                fieldsWithValue++;
            }
        }

        const average = fieldsWithValue > 0 ? parseFloat((total / fieldsWithValue).toFixed(1)) : undefined;
        console.log("Average:", average);
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