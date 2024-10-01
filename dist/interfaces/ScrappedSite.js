"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrappedSite = void 0;
class ScrappedSite {
    constructor(nombre, direccion, calificacionGoogle, types, link, location, placeId, rating, tipos) {
        this.placeId = placeId;
        this.nombre = nombre;
        this.direccion = direccion;
        this.calificacionGoogle = calificacionGoogle;
        this.types = types;
        this.link = link;
        this.location = location;
        this.rating = rating || 0;
        this.tipos = tipos || [];
    }
}
exports.ScrappedSite = ScrappedSite;
