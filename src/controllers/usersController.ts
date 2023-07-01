import { Request, Response } from "express"
import { handleHttp } from "../utils/error.handle"
import { logInUserService, registerUsuarioService, saveSiteService, unsaveSiteService } from "../services/usuariosService"

const logInUserController = async (req: Request, res: Response) => {
    try {
        const responseLogIn = await logInUserService({ email: req.body.email, password: req.body.password });
        //Check if the user was logged in
        if (responseLogIn.error) {
            res.status(responseLogIn.status).send({ msg: responseLogIn.error })
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
            saved: [req.body.saved], //TODO quitar
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            tipoDiscapacidad: req.body.tipoDiscapacidad,
        });
        //Check if the user was created
        if (responseReg.error) {
            res.status(responseReg.status).send({ msg: responseReg.error })
        } else {
            res.send({ msg: "Usuario creado correctamente", user: responseReg.usuario })
        }
    } catch (e) {
        handleHttp(res, "Error en el registro: " + e)
    }
}

const saveSiteController = async (req: Request, res: Response) => {
    try {
        const responseSave = await saveSiteService(req.body.email, req.body.site);

        if (responseSave.error) {
            res.status(responseSave.status).send({ msg: responseSave.error })
        } else {
            res.send({ msg: "Sitio guardado correctamente" })
        }
    } catch (e) {
        handleHttp(res, "Error en guardado de sitio: " + e)
    }
}

const unsaveSiteController = async (req: Request, res: Response) => {
    try {
        const responseUnsave = await unsaveSiteService(req.body.email, req.body.placeId);
    } catch (e) {
        handleHttp(res, "Error en guardado de sitio: " + e)
    }
}

const dummyController = async (req: Request, res: Response) => {
    try {
        res.send({ msg: "Server up" })
    } catch (e) {
        handleHttp(res, "Error en dummy: " + e)
    }
}


export { logInUserController, registerUserController, saveSiteController, unsaveSiteController, dummyController }