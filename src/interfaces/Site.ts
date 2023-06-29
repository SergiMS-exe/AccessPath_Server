type SiteLocation = {
    latitude: number;
    longitude: number;
};
type Site = {
    placeId: string;
    nombre: string;
    direccion: string;
    calificacionGoogle: number;
    location: SiteLocation;
    types: string[];
};

export default Site;