import { Request, Response } from "express"
import { handleHttp } from "../utils/error.handle"
import { logInUserService, registerUsuarioService } from "../services/usuariosService"

const logInUserController = async (req: Request, res: Response) => {
    try {
        const responseLogIn = await logInUserService({ email: req.body.email, password: req.body.password });
        //Check if the user was logged in
        if (responseLogIn.error) {
            res.send({ msg: responseLogIn.error })
        } else {
            res.send({ msg: "Sesion iniciada correctamente", user: responseLogIn.usuario })
        }
    } catch (e) {
        handleHttp(res, "Error en el login: " + e)
    }
}

const registerUserController = async (req: Request, res: Response) => {
    try {
        const responseReg = await registerUsuarioService({
            email: req.body.email,
            password: req.body.password,
            saved: [req.body.saved],
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            tipoDiscapacidad: req.body.tipoDiscapacidad,
        });
        //Check if the user was created
        if (responseReg.error) {
            res.send({ msg: responseReg.error })
        } else {
            res.send({ msg: "Usuario creado correctamente", user: responseReg.usuario })
        }
    } catch (e) {
        handleHttp(res, "Error en el registro: " + e)
    }
}


const dummyController = async (req: Request, res: Response) => {
    try {
        res.send({ msg: "Server up" })
    } catch (e) {
        handleHttp(res, "Error en dummy: " + e)
    }
}

export { logInUserController, registerUserController, dummyController }