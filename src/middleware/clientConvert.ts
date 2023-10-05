import { Request, Response, NextFunction } from "express";
import { transformArrayToClientFormat, transformToClientFormat } from "../utils/auxiliar.handle";

export const convertToClientMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.sitios && res.locals.mensaje) {
        res.locals.sitios = transformArrayToClientFormat(res.locals.sitios);
        res.status(200).send({ msg: res.locals.mensaje, sites: res.locals.sitios })
    } else if (res.locals.sitio && res.locals.mensaje) {
        res.locals.sitio = transformToClientFormat(res.locals.sitio)[0];
        res.status(200).send({ msg: res.locals.mensaje, site: res.locals.sitio })
    }
    next();
};


