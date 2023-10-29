import "dotenv/config";
import { Site, SiteLocation } from "../interfaces/Site";

export const handleFindSitesByTextGoogle = async (text: string) => {
    const centro: SiteLocation = {
        latitude: 43.34918,
        longitude: -5.61103
    }

    const occidente: SiteLocation = {
        latitude: 43.31083,
        longitude: -6.57842
    }

    const oriente: SiteLocation = {
        latitude: 43.38709,
        longitude: -4.88617
    }

    var response = await makeRequestGooglePlaces(text, centro);
    console.log(JSON.stringify(response));
    if (response.results.length == 0)
        response = await makeRequestGooglePlaces(text, occidente);
    if (response.results.length == 0)
        response = await makeRequestGooglePlaces(text, oriente, 30000);

    return convertToSite(response);
}

async function makeRequestGooglePlaces(query: string, location: SiteLocation, radius: number = 50000) {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place';
    const uri = baseUrl + '/textsearch/json';

    const apiKey = <string>process.env.GOOGLE_PLACES_API_KEY || '';

    const params = new URLSearchParams({
        key: apiKey,
        query: query,
        radius: radius.toString(),
        location: `${location.latitude},${location.longitude}`,
        language: 'es'
    });

    try {
        const response = await fetch(`${uri}?${params}`);
        if (!response.ok) {
            throw new Error(`Error al hacer la petición: ${response.status} ${response.statusText}`);
        }
        const data: PlaceResponse = await response.json();
        return data;
    } catch (error: any) {
        throw new Error(`Ocurrió un error en la petición a Google Places: ${error.message}`);
    }
}

function convertToSite(placeResponse: PlaceResponse): Site[] {
    return placeResponse.results.map(result => {
        const { place_id, name, formatted_address, geometry, types, rating } = result;
        const { lat, lng } = geometry.location;

        const location: SiteLocation = {
            latitude: lat,
            longitude: lng
        };

        return new Site(place_id, name, formatted_address, rating, location, types);
    });
}

interface PlaceResponse {
    results: Array<{
        place_id: string;
        name: string;
        formatted_address: string;
        rating: number;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        types: string[];
    }>;
}

