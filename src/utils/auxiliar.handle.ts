import { Site } from "../interfaces/Site";


export function transformArrayToClientFormat(sites: any[]): any[] {
    return sites.map(transformToClientFormat);
}

export function transformToClientFormat(site: any): any {
    const actualSite = site._doc ? site._doc : site;

    // Extracting location details
    const { location } = actualSite;
    if (location && location.type === "Point" && Array.isArray(location.coordinates)) {
        const [longitude, latitude] = location.coordinates;
        actualSite.location = { latitude, longitude };  // Updating the location format
        delete actualSite.location.type;  // Removing the type field
        delete actualSite.location.coordinates;  // Removing the coordinates field
    }

    return actualSite;
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