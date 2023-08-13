import CommentType from "./CommentType";

export type SiteLocation = {
    latitude: number;
    longitude: number;
};

export class Site {
    public placeId: string;
    public nombre: string;
    public direccion: string;
    public calificacionGoogle: number;
    public comentarios?: CommentType[];
    public location: SiteLocation;
    public types: string[];

    constructor(
      placeId: string,
      nombre: string,
      direccion: string,
      calificacionGoogle: number,
      location: SiteLocation,
      types: string[],
      comentarios?: CommentType[]
    ) {
      this.placeId = placeId;
      this.nombre = nombre;
      this.direccion = direccion;
      this.calificacionGoogle = calificacionGoogle;
      this.location = location;
      this.types = types;
      this.comentarios = comentarios;
    }
}
