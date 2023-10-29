import { Site } from "../interfaces/Site";
import { Valoracion } from "../interfaces/Valoracion";

export function transformArrayToClientFormat(sites: any[]): any[] {
    return sites.map(transformToClientFormat);
}

export function transformValoracionSiteArray(array: { valoracion: Valoracion, site: Site }[]): any[] {
    return array.map(item => {
        // Transforma solo la parte Site del objeto
        const transformedSite = transformToClientFormat(item.site);

        // Devuelve un objeto con la Valoracion y el Site asociado transformado
        return {
            valoracion: item.valoracion,
            site: transformedSite
        };
    });
}


export function transformToClientFormat(site: any): any {
    const actualSite = site._doc ? site._doc : site;

    // Extracting location details
    const { location } = actualSite;
    if (checkLocationFormat(location)) {
        const [longitude, latitude] = location.coordinates;
        actualSite.location = { latitude, longitude };  // Updating the location format
        delete actualSite.location.type;  // Removing the type field
        delete actualSite.location.coordinates;  // Removing the coordinates field
    }

    return actualSite;
}

function checkLocationFormat(location: any): boolean {
    if (location && location.type && location.coordinates && location.type === "Point" && Array.isArray(location.coordinates)) {
        return true;
    }
    return false;
}

export function transformToServerFormat(site: any): any {
    const actualSite = site;  // Accessing the _doc field

    // Extracting location details
    const { location } = actualSite;
    if (location && location.latitude && location.longitude) {
        actualSite.location = {
            type: "Point",
            coordinates: [location.longitude, location.latitude]
        };
    }

    return actualSite;
}

export function transformToServerFormatArray(sites: any[]): any[] {
    return sites.map(transformToServerFormat);
}