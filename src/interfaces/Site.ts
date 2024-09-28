import CommentType from "./CommentType";
import { Valoracion } from "./Valoracion";

export type SiteLocation = {
    latitude: number;
    longitude: number;
};

export type Photo = {
    usuarioId: string;
    base64: string;
    alternativeText?: string;
}

export class Site {
    public placeId: string;
    public nombre: string;
    public direccion: string;
    public calificacionGoogle: number;
    public comentarios?: CommentType[];
    public location: SiteLocation;
    public types: string[];
    public link?: string;
    public valoraciones?: Valoracion;
    public fotos?: Photo[];

    constructor(
        placeId: string,
        nombre: string,
        direccion: string,
        calificacionGoogle: number,
        location: SiteLocation,
        types: string[],
        link?: string,
        valoraciones?: Valoracion,
        comentarios?: CommentType[],
        fotos?: Photo[]
    ) {
        this.placeId = placeId;
        this.nombre = nombre;
        this.direccion = direccion;
        this.calificacionGoogle = calificacionGoogle;
        this.location = location;
        this.types = types;
        this.link = link;
        this.valoraciones = valoraciones;
        this.comentarios = comentarios;
        this.fotos = fotos;
    }
}