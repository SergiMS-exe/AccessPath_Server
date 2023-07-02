import CommentType from "./CommentType";

type SiteLocation = {
    latitude: number;
    longitude: number;
};
type Site = {
    placeId: string;
    nombre: string;
    direccion: string;
    calificacionGoogle: number;
    comments?: CommentType[];
    location: SiteLocation;
    types: string[];
};

export default Site;