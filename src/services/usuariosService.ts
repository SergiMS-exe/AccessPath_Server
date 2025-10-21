import Person from "../interfaces/Person"
import Auth from "../interfaces/Auth";
import UsuarioModel from "../models/usuarioModel"
import { encrypt, verified } from "../utils/bcrypt.handle";
import SitioModel from "../models/sitioModel";
import { Site } from "../interfaces/Site";
import { ObjectId } from "mongodb";
import ValoracionModel from "../models/valoracionModel";
import { PaginationParams } from "../interfaces/Pagination";
import { paginateArray } from "../utils/pagination.util";

const registerUsuarioService = async (usuario: Person) => {
    if (await UsuarioModel.findOne({ email: usuario.email })) return { error: "Ya hay un usuario con ese email", status: 409 };
    usuario._id = new ObjectId();
    usuario.password = await encrypt(usuario.password!);
    const responseInsert = await UsuarioModel.create(usuario);
    return { usuario: responseInsert };
}

const logInUserService = async ({ email, password }: Auth) => {
    const userFound = await UsuarioModel.findOne({ email: email })
    if (!userFound) return { error: "No hay un usuario registrado con ese email", status: 404 };

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(password, passwdHash);
    if (!isPasswdCorrect) return { error: "Contraseña incorrecta", status: 401 };

    return { usuario: userFound };
}

const deleteUsuarioService = async (usuarioId: string) => {
    const userFound = await UsuarioModel.findOneAndDelete({ _id: usuarioId });
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };
    else return { status: 200 };
}

const saveSiteService = async (usuarioId: string, site: Site) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };

    const savedPlaces = userFound.saved;

    //si no hay un sitio guardado en BD, se guarda
    await SitioModel.findOneAndUpdate(
        { placeId: site.placeId },
        site,
        { upsert: true }
    );

    if (savedPlaces?.includes(site.placeId))
        return { error: "El sitio ya esta guardado", status: 409 };
    else {
        const updateResult = await UsuarioModel.updateOne({ _id: usuarioId }, { $push: { saved: site.placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
}

const unsaveSiteService = async (usuarioId: string, placeId: string) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };

    const savedPlaces = userFound.saved;

    if (!savedPlaces?.includes(placeId))
        return { error: "El sitio ya se ha eliminado de la lista de guardados", status: 409 };
    else {
        const updateResult = await UsuarioModel.updateOne({ _id: usuarioId }, { $pull: { saved: placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
}

const getSavedSitesService = async (
    usuarioId: string,
    paginationParams: PaginationParams
) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }

    const savedPlaces = userFound.saved || [];

    // Si no hay sitios guardados, devolver respuesta vacía con paginacion
    if (savedPlaces.length === 0) {
        return {
            savedSites: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: paginationParams.limit || 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }

    // Paginar primero los IDs
    const paginatedIds = paginateArray(savedPlaces, paginationParams);

    // Buscar solo los sitios de la pagina actual
    const savedSites = await SitioModel.find({
        placeId: { $in: paginatedIds.data }
    }).lean();

    return {
        savedSites,
        pagination: paginatedIds.pagination
    };
};

const getUserCommentsService = async (
    usuarioId: string,
    paginationParams: PaginationParams
) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }

    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;

    // Agregacion con paginacion
    const [sites, totalCount] = await Promise.all([
        SitioModel.aggregate([
            { $unwind: "$comentarios" },
            { $match: { "comentarios.usuarioId": usuarioId } },
            {
                $group: {
                    _id: "$_id",
                    comentarios: { $push: "$comentarios" },
                    sitio: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$sitio", { comentarios: "$comentarios" }]
                    }
                }
            },
            { $project: { _id: 0 } },
            { $sort: { "comentarios.date": -1 } }, // Mas recientes primero
            { $skip: skip },
            { $limit: limit }
        ]),
        // Contar total de sitios con comentarios del usuario
        SitioModel.aggregate([
            { $unwind: "$comentarios" },
            { $match: { "comentarios.usuarioId": usuarioId } },
            { $group: { _id: "$_id" } },
            { $count: "total" }
        ])
    ]);

    const totalItems = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        sites,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

const getUserRatingsService = async (
    usuarioId: string,
    paginationParams: PaginationParams
) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }

    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;

    // Obtener valoraciones paginadas
    const [valoraciones, totalItems] = await Promise.all([
        ValoracionModel.find({ userId: usuarioId })
            .sort({ _id: -1 }) // Más recientes primero
            .skip(skip)
            .limit(limit)
            .lean(),
        ValoracionModel.countDocuments({ userId: usuarioId })
    ]);

    // Para cada valoración, obtener el sitio
    const sitesWithValoracion = await Promise.all(
        valoraciones.map(async (valoracion) => {
            const site = await SitioModel.findOne({ placeId: valoracion.placeId }).lean();
            
            if (site) {
                return { valoracion, site };
            } else {
                // Eliminar valoración huérfana
                await ValoracionModel.findOneAndDelete({ _id: valoracion._id });
                return null;
            }
        })
    ).then((sites) => sites.filter((value) => value !== null));

    const totalPages = Math.ceil(totalItems / limit);

    return {
        sitesWithValoracion,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

const getUserPhotosService = async (
    usuarioId: string,
    paginationParams: PaginationParams
) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) {
        return { error: "No hay un usuario registrado con ese id", status: 404 };
    }

    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
    const skip = (page - 1) * limit;

    // Agregación con paginación
    const [sites, totalCount] = await Promise.all([
        SitioModel.aggregate([
            { $unwind: "$fotos" },
            { $match: { "fotos.usuarioId": usuarioId } },
            {
                $group: {
                    _id: "$_id",
                    fotos: { $push: "$fotos" },
                    sitio: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$sitio", { fotos: "$fotos" }]
                    }
                }
            },
            { $project: { _id: 0 } },
            { $skip: skip },
            { $limit: limit }
        ]),
        // Contar total de sitios con fotos del usuario
        SitioModel.aggregate([
            { $unwind: "$fotos" },
            { $match: { "fotos.usuarioId": usuarioId } },
            { $group: { _id: "$_id" } },
            { $count: "total" }
        ])
    ]);

    const totalItems = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        sites,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

const editUserService = async (usuario: Person) => {
    const userFound = await getUserInDB(usuario._id!.toString());
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };

    const userUpdated = await UsuarioModel.updateOne({ _id: usuario._id }, usuario);
    if (userUpdated.modifiedCount === 1)
        return { status: 200 };
    else
        return { error: "Se debe modificar algún campo para poder editar el perfil", status: 500 };
}

const editPasswordService = async (usuarioId: string, oldPassword: string, newPassword: string) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(oldPassword, passwdHash);
    if (!isPasswdCorrect) return { error: "Contraseña actual incorrecta", status: 401 };

    const newPasswdHash = await encrypt(newPassword);
    const userUpdated = await UsuarioModel.updateOne({ _id: usuarioId }, { password: newPasswdHash });
    if (userUpdated.modifiedCount === 1)
        return { status: 200 };
    else
        return { error: "No se pudo actualizar la contraseña", status: 500 };
}

//Utils
const getUserInDB = async (userId: string) => {
    const userFound = await UsuarioModel.findOne({ _id: userId })
    return userFound;
}

export {
    registerUsuarioService,
    logInUserService,
    deleteUsuarioService,
    saveSiteService,
    unsaveSiteService,
    getSavedSitesService,
    getUserCommentsService,
    getUserRatingsService,
    getUserPhotosService,
    editUserService,
    editPasswordService
}