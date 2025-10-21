import { Request, Response, NextFunction } from "express";
import { transformArrayToClientFormat, transformToClientFormat, transformToServerFormat, transformToServerFormatArray, transformValoracionSiteArray } from "../utils/auxiliar.handle";

export const convertToClientMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.sitios && res.locals.mensaje) {
        res.locals.sitios = transformArrayToClientFormat(res.locals.sitios);
        if (res.locals.pagination)
            res.status(res.statusCode).send({ msg: res.locals.mensaje, sites: res.locals.sitios, pagination: res.locals.pagination})
        else 
            res.status(res.statusCode).send({ msg: res.locals.mensaje, sites: res.locals.sitios})
    } else if (res.locals.newPlace && res.locals.mensaje) {
        res.locals.newPlace = transformToClientFormat(res.locals.newPlace);
        if (res.locals.pagination)
            res.status(res.statusCode).send({ msg: res.locals.mensaje, newPlace: res.locals.newPlace, pagination: res.locals.pagination})
        else 
            res.status(res.statusCode).send({ msg: res.locals.mensaje, newPlace: res.locals.newPlace})
    }
    next();
};

export const convertValoracionSiteMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.sitiosConValoracion && res.locals.mensaje) {
        // De tipo { Valoracion, Site }[]
        res.locals.sitiosConValoracion = transformValoracionSiteArray(res.locals.sitiosConValoracion);
        
        // Envía la respuesta con los sitios transformados
        if (res.locals.pagination)
            res.status(res.statusCode).send({ msg: res.locals.mensaje, sitesWRating: res.locals.sitiosConValoracion, pagination: res.locals.pagination});
        else
            res.status(res.statusCode).send({ msg: res.locals.mensaje, sitesWRating: res.locals.sitiosConValoracion, pagination: res.locals.pagination});
    } else {
        next();
    }
};


export const convertToServerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.sitios) {
        req.body.sitios = transformToServerFormatArray(req.body.sitios);
    } else if (req.body.site) {
        req.body.site = transformToServerFormat(req.body.site);
    }
    next();
}