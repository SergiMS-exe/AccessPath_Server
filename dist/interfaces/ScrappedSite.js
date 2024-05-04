"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrappedSite = void 0;
class ScrappedSite {
    constructor(nombre, direccion, calificacionGoogle, types, link, location) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.calificacionGoogle = calificacionGoogle;
        this.types = types;
        this.link = link;
        this.location = location;
    }
}
exports.ScrappedSite = ScrappedSite;
