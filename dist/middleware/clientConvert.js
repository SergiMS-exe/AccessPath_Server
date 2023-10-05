"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToClientMiddleware = void 0;
const auxiliar_handle_1 = require("../utils/auxiliar.handle");
const convertToClientMiddleware = (req, res, next) => {
    if (res.locals.sitios && res.locals.mensaje) {
        res.locals.sitios = (0, auxiliar_handle_1.transformArrayToClientFormat)(res.locals.sitios);
        res.status(200).send({ msg: res.locals.mensaje, sites: res.locals.sitios });
    }
    else if (res.locals.sitio && res.locals.mensaje) {
        res.locals.sitio = (0, auxiliar_handle_1.transformToClientFormat)(res.locals.sitio)[0];
        res.status(200).send({ msg: res.locals.mensaje, site: res.locals.sitio });
    }
    next();
};
exports.convertToClientMiddleware = convertToClientMiddleware;
