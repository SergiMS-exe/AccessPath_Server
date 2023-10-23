"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToServerMiddleware = exports.convertToClientMiddleware = void 0;
const auxiliar_handle_1 = require("../utils/auxiliar.handle");
const convertToClientMiddleware = (req, res, next) => {
    if (res.locals.sitios && res.locals.mensaje) {
        res.locals.sitios = (0, auxiliar_handle_1.transformArrayToClientFormat)(res.locals.sitios);
        res.status(200).send({ msg: res.locals.mensaje, sites: res.locals.sitios });
    }
    else if (res.locals.newPlace && res.locals.mensaje) {
        res.locals.newPlace = (0, auxiliar_handle_1.transformToClientFormat)(res.locals.newPlace);
        res.status(200).send({ msg: res.locals.mensaje, newPlace: res.locals.newPlace });
    }
    next();
};
exports.convertToClientMiddleware = convertToClientMiddleware;
const convertToServerMiddleware = (req, res, next) => {
    if (req.body.sitios) {
        req.body.sitios = (0, auxiliar_handle_1.transformToServerFormatArray)(req.body.sitios);
    }
    else if (req.body.sitio) {
        req.body.sitio = (0, auxiliar_handle_1.transformToServerFormat)(req.body.sitio);
    }
    next();
};
exports.convertToServerMiddleware = convertToServerMiddleware;
