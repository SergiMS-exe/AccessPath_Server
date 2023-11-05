"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle404Error = exports.handleHttp = void 0;
const handleHttp = (res, errorMessage, status) => {
    // console.error(errorMessage)
    res.status(status || 500).send({ msg: errorMessage } || { msg: "Error en el servidor" });
};
exports.handleHttp = handleHttp;
const handle404Error = (res) => {
    res.status(404).send('Error 404: Página no encontrada');
};
exports.handle404Error = handle404Error;
