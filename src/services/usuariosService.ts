import Person from "../interfaces/Person"
import Auth from "../interfaces/Auth";
import UsuarioModel from "../models/usuarioModel"
import { encrypt, verified } from "../utils/bcrypt.handle";

const registerUsuarioService = async (usuario: Person) => {
    usuario.password = await encrypt(usuario.password!);
    const responseInsert = await UsuarioModel.create(usuario);
    return responseInsert;
}

const logInUserService = async ({ email, password }: Auth) => {
    const userFound = await UsuarioModel.findOne({ email })
    console.log(userFound)
    if (!userFound) return "NOT_FOUND_USER";

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(password, passwdHash);
    if (!isPasswdCorrect) return "PASSWORD_INCORRECT";

    //TODO ver si hacer jwt
    return userFound;
}

export { registerUsuarioService, logInUserService }