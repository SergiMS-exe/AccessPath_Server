"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToServerFormatArray = exports.transformToServerFormat = exports.transformToClientFormat = exports.transformValoracionSiteArray = exports.transformArrayToClientFormat = void 0;
function transformArrayToClientFormat(sites) {
    return sites.map(transformToClientFormat);
}
exports.transformArrayToClientFormat = transformArrayToClientFormat;
function transformValoracionSiteArray(array) {
    //filter those which dooes not have valoracion or site
    //array = array.filter(item => item.valoracion && item.site);
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
exports.transformValoracionSiteArray = transformValoracionSiteArray;
function transformToClientFormat(site) {
    const actualSite = site._doc ? site._doc : site;
    const { location } = actualSite;
    if (checkLocationFormat(location)) {
        const [longitude, latitude] = location.coordinates;
        actualSite.location = { latitude, longitude };
        delete actualSite.location.type;
        delete actualSite.location.coordinates;
    }
    return actualSite;
}
exports.transformToClientFormat = transformToClientFormat;
function checkLocationFormat(location) {
    if (location && location.type && location.coordinates && location.type === "Point" && Array.isArray(location.coordinates)) {
        return true;
    }
    return false;
}
function transformToServerFormat(site) {
    const actualSite = site; // Accessing the _doc field
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
exports.transformToServerFormat = transformToServerFormat;
function transformToServerFormatArray(sites) {
    return sites.map(transformToServerFormat);
}
exports.transformToServerFormatArray = transformToServerFormatArray;
