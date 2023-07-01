import Person from "../interfaces/Person"
import Auth from "../interfaces/Auth";
import UsuarioModel from "../models/usuarioModel"
import { encrypt, verified } from "../utils/bcrypt.handle";
import SitioModel from "../models/sitioModel";
import Site from "../interfaces/Site";

const registerUsuarioService = async (usuario: Person) => {
    const userFound = await UsuarioModel.findOne({ email: usuario.email })
    if (userFound) return { error: "Ya hay un usuario con ese email", status: 409 };

    usuario.password = await encrypt(usuario.password!);
    const responseInsert = await UsuarioModel.create(usuario);
    return { usuario: responseInsert };
}

const logInUserService = async ({ email, password }: Auth) => {
    const userFound = await UsuarioModel.findOne({ email })
    if (!userFound) return { error: "No hay un usuario registrado con ese email", status: 404 };

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(password, passwdHash);
    if (!isPasswdCorrect) return { error: "Contraseña incorrecta", status: 401 };

    //TODO ver si hacer jwt
    return { usuario: userFound };
}

const saveSiteService = async (userEmail: string, site: Site) => {
    const userFound = await UsuarioModel.findOne({ email: userEmail });
    if (!userFound) return { error: "No hay un usuario registrado con ese email", status: 404 };

    const savedPlaces = userFound.saved;

    //si no hay un sitio guardado en BD, se guarda
    const siteFound = await SitioModel.findOne({ placeId: site.placeId })
    if (!siteFound)
        await SitioModel.create(site);

    if (savedPlaces?.includes(site.placeId))
        return { error: "El sitio ya está guardado", status: 409 };
    else {
        const updateResult = await UsuarioModel.updateOne({ email: userEmail }, { $push: { saved: site.placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
}

const unsaveSiteService = async (userEmail: string, placeId: string) => {
    const userFound = await UsuarioModel.findOne({ email: userEmail });
    if (!userFound) return { error: "No hay un usuario registrado con ese email", status: 404 };

    const savedPlaces = userFound.saved;

    if (!savedPlaces?.includes(placeId))
        return { error: "El sitio ya se ha eliminado de la lista de guardados", status: 409 };
    else {
        const updateResult = await UsuarioModel.updateOne({ email: userEmail }, { $pull: { saved: placeId } });
        if (updateResult.modifiedCount === 1)
            return { status: 200 };
        else
            return { error: "No se pudo guardar el sitio", status: 500 };
    }
}

export { registerUsuarioService, logInUserService, saveSiteService, unsaveSiteService }