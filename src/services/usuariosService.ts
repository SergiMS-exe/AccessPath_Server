import Person from "../interfaces/Person"
import Auth from "../interfaces/Auth";
import UsuarioModel from "../models/usuarioModel"
import { encrypt, verified } from "../utils/bcrypt.handle";
import SitioModel from "../models/sitioModel";
import Site from "../interfaces/Site";

const registerUsuarioService = async (usuario: Person) => {
    if (await getUserInDB(usuario.email)) return { error: "Ya hay un usuario con ese email", status: 409 };

    usuario.password = await encrypt(usuario.password!);
    const responseInsert = await UsuarioModel.create(usuario);
    return { usuario: responseInsert };
}

const logInUserService = async ({ email, password }: Auth) => {
    const userFound = await getUserInDB(email);
    if (!userFound) return { error: "No hay un usuario registrado con ese email", status: 404 };

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(password, passwdHash);
    if (!isPasswdCorrect) return { error: "Contraseña incorrecta", status: 401 };

    //TODO ver si hacer jwt
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
        return { error: "El sitio ya está guardado", status: 409 };
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

const getSavedSitesService = async (usuarioId: string) => {
    const userFound = await getUserInDB(usuarioId);
    if (!userFound) return { error: "No hay un usuario registrado con ese id", status: 404 };

    const savedPlaces = userFound.saved;
    if (!savedPlaces) return { error: "No hay sitios guardados", status: 404 };

    const savedSites = await SitioModel.find({ placeId: { $in: savedPlaces } });
    return { savedSites };
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
    getSavedSitesService
}