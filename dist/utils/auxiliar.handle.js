"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToServerFormatArray = exports.transformToServerFormat = exports.transformToClientFormat = exports.transformArrayToClientFormat = void 0;
function transformArrayToClientFormat(sites) {
    return sites.map(transformToClientFormat);
}
exports.transformArrayToClientFormat = transformArrayToClientFormat;
function transformToClientFormat(site) {
    const actualSite = site._doc ? site._doc : site;
    // Extracting location details
    const { location } = actualSite;
    if (location && location.type === "Point" && Array.isArray(location.coordinates)) {
        const [longitude, latitude] = location.coordinates;
        actualSite.location = { latitude, longitude }; // Updating the location format
        delete actualSite.location.type; // Removing the type field
        delete actualSite.location.coordinates; // Removing the coordinates field
    }
    return actualSite;
}
exports.transformToClientFormat = transformToClientFormat;
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
