

export function transformArrayToClientFormat(sites: any[]): any[] {
    return sites.map(transformToClientFormat);
}

export function transformToClientFormat(site: any): any {
    const actualSite = site._doc;  // Accessing the _doc field

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