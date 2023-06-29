import Person from "../interfaces/Person"
import Auth from "../interfaces/Auth";
import UsuarioModel from "../models/usuarioModel"
import { encrypt, verified } from "../utils/bcrypt.handle";

const registerUsuarioService = async (usuario: Person) => {
    const userFound = await UsuarioModel.findOne({ email: usuario.email })
    if (userFound) return {error: "Ya hay un usuario con ese email"};

    usuario.password = await encrypt(usuario.password!);
    const responseInsert = await UsuarioModel.create(usuario);
    return {usuario: responseInsert};
}

const logInUserService = async ({ email, password }: Auth) => {
    const userFound = await UsuarioModel.findOne({ email })
    if (!userFound) return {error: "No hay un usuario registrado con ese email"};

    const passwdHash = userFound.password!;
    const isPasswdCorrect = await verified(password, passwdHash);
    if (!isPasswdCorrect) return {error: "Contraseña incorrecta"};

    //TODO ver si hacer jwt
    return {usuario: userFound};
}

export { registerUsuarioService, logInUserService }