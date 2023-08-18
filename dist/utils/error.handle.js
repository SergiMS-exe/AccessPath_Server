"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHttp = void 0;
const handleHttp = (res, errorMessage, status) => {
    console.error(errorMessage);
    res.status(status || 500).send({ msg: errorMessage } || { msg: "Error en el servidor" });
};
exports.handleHttp = handleHttp;
