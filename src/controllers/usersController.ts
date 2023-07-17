import { NextFunction, Request, Response } from "express"
import { handleHttp } from "../utils/error.handle"
import { deleteUsuarioService, getSavedSitesService, logInUserService, registerUsuarioService, saveSiteService, unsaveSiteService } from "../services/usuariosService"

const logInUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.email || !req.body.password) return handleHttp(res, "Faltan datos en el body", 400)
        else {
            const responseLogIn = await logInUserService({ email: req.body.email, password: req.body.password });
            //Check if the user was logged in
            if (responseLogIn.error) {
                res.status(responseLogIn.status).send({ msg: responseLogIn.error })
            } else {
                res.status(200).send({ msg: "Sesion iniciada correctamente", user: responseLogIn.usuario })
            }
        }
    } catch (e: any) {
        handleHttp(res, "Error en el login: " + e.message)
    } finally {
        next()
    }
}

const registerUserController = async (req: Request, res: Response, next: NextFunction) => {
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
            res.status(200).send({ msg: "Usuario creado correctamente", user: responseReg.usuario })
        }
    } catch (e: any) {
        handleHttp(res, "Error en el registro: " + e.message)
    } finally {
        next()
    }
}

const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseDelete = await deleteUsuarioService(req.params.userId);
        if (responseDelete.error) {
            res.status(responseDelete.status).send({ msg: responseDelete.error })
        }
        else {
            res.status(200).send({ msg: "Usuario borrado correctamente" })
        }
    } catch (e: any) {
        handleHttp(res, "Error en el borrado de usuario: " + e.message)
    } finally {
        next()
    }
}

const saveSiteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseSave = await saveSiteService(req.body.email, req.body.site);

        if (responseSave.error) {
            res.status(responseSave.status).send({ msg: responseSave.error })
        } else {
            res.status(200).send({ msg: "Sitio guardado correctamente" })
        }
    } catch (e: any) {
        handleHttp(res, "Error en guardado de sitio: " + e.message)
    } finally {
        next()
    }
}

const unsaveSiteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseUnsave = await unsaveSiteService(req.body.email, req.body.placeId);
        if (responseUnsave.error) {
            res.status(responseUnsave.status).send({ msg: responseUnsave.error })
        } else {
            res.status(200).send({ msg: "Sitio guardado correctamente" })
        }
    } catch (e: any) {
        handleHttp(res, "Error en guardado de sitio: " + e.message)
    } finally {
        next()
    }
}

const getSavedSitesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responseGetSaved = await getSavedSitesService(req.params.userId);
        if (responseGetSaved.error) {
            res.status(responseGetSaved.status).send({ msg: responseGetSaved.error })
        } else {
            res.status(200).send({ msg: "Sitios obtenidos correctamente", saved: responseGetSaved.savedSites })
        }
    } catch (e: any) {
        handleHttp(res, "Error en guardado de sitio: " + e.message)
    } finally {
        next()
    }
}

const dummyController = async (req: Request, res: Response) => {
    try {
        res.send({ msg: "Server up" })
    } catch (e) {
        handleHttp(res, "Error en dummy: " + e)
    }
}


export {
    logInUserController,
    registerUserController,
    deleteUserController,
    saveSiteController,
    unsaveSiteController,
    getSavedSitesController,
    dummyController
}