import { Request, Response, NextFunction } from "express";
import { transformArrayToClientFormat, transformToClientFormat, transformToServerFormat, transformToServerFormatArray } from "../utils/auxiliar.handle";

export const convertToClientMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.sitios && res.locals.mensaje) {
        res.locals.sitios = transformArrayToClientFormat(res.locals.sitios);
        res.status(200).send({ msg: res.locals.mensaje, sites: res.locals.sitios })
    } else if (res.locals.newPlace && res.locals.mensaje) {
        res.locals.newPlace = transformToClientFormat(res.locals.newPlace);
        res.status(200).send({ msg: res.locals.mensaje, newPlace: res.locals.newPlace })
    }
    next();
};


export const convertToServerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.sitios) {
        req.body.sitios = transformToServerFormatArray(req.body.sitios);
    } else if (req.body.sitio) {
        req.body.sitio = transformToServerFormat(req.body.sitio);
    }
    next();
}