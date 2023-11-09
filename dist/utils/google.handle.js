"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFindSitesByTextGoogle = void 0;
require("dotenv/config");
const Site_1 = require("../interfaces/Site");
const handleFindSitesByTextGoogle = (text) => __awaiter(void 0, void 0, void 0, function* () {
    const centro = {
        latitude: 43.34918,
        longitude: -5.61103
    };
    const occidente = {
        latitude: 43.31083,
        longitude: -6.57842
    };
    const oriente = {
        latitude: 43.38709,
        longitude: -4.88617
    };
    var response = yield makeRequestGooglePlaces(text, centro);
    console.log(JSON.stringify(response));
    if (response.results.length == 0)
        response = yield makeRequestGooglePlaces(text, occidente);
    if (response.results.length == 0)
        response = yield makeRequestGooglePlaces(text, oriente, 30000);
    return convertToSite(response);
});
exports.handleFindSitesByTextGoogle = handleFindSitesByTextGoogle;
function makeRequestGooglePlaces(query, location, radius = 100000) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place';
        const uri = baseUrl + '/textsearch/json';
        const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
        const params = new URLSearchParams({
            key: apiKey,
            query: query,
            radius: radius.toString(),
            location: `${location.latitude},${location.longitude}`,
            language: 'es'
        });
        try {
            const response = yield fetch(`${uri}?${params}`);
            if (!response.ok) {
                throw new Error(`Error al hacer la petición: ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            //filter only the places which are in Asturias
            data.results = data.results.filter((place) => {
                return place.formatted_address.toLocaleLowerCase().includes('asturias');
            });
            return data;
        }
        catch (error) {
            throw new Error(`Ocurrió un error en la petición a Google Places: ${error.message}`);
        }
    });
}
function convertToSite(placeResponse) {
    return placeResponse.results.map(result => {
        const { place_id, name, formatted_address, geometry, types, rating } = result;
        const { lat, lng } = geometry.location;
        const location = {
            latitude: lat,
            longitude: lng
        };
        return new Site_1.Site(place_id, name, formatted_address, rating, location, types);
    });
}
