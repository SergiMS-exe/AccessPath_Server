import { SiteLocation } from "./Site";

export class ScrappedSite {
    public placeId?: string;
    public nombre: string;
    public direccion: string;
    public calificacionGoogle: number;
    public location?: SiteLocation;
    public types: string[];
    public link: string;

    constructor(
        nombre: string,
        direccion: string,
        calificacionGoogle: number,
        types: string[],
        link: string,
        location?: SiteLocation,
        placeId?: string,
    ) {
        this.placeId = placeId;
        this.nombre = nombre;
        this.direccion = direccion;
        this.calificacionGoogle = calificacionGoogle;
        this.types = types;
        this.link = link;
        this.location = location;
    }
}