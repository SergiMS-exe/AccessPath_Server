"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Site = void 0;
class Site {
    constructor(placeId, nombre, direccion, calificacionGoogle, location, types, valoraciones, comentarios, fotos) {
        this.placeId = placeId;
        this.nombre = nombre;
        this.direccion = direccion;
        this.calificacionGoogle = calificacionGoogle;
        this.location = location;
        this.types = types;
        this.valoraciones = valoraciones;
        this.comentarios = comentarios;
        this.fotos = fotos;
    }
}
exports.Site = Site;
