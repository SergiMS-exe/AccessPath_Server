import "dotenv/config";
import { Site, SiteLocation } from "../interfaces/Site";
import puppeteer, { Page } from "puppeteer";
import fs from 'fs';
import chromium from "chrome-aws-lambda";
import * as pluscodes from "pluscodes";
import { ScrappedSite } from "../interfaces/ScrappedSite";

const COOKIES_FILE_PATH = './cookies.json';  // Archivo donde se guarda la sesión (cookies y localStorage)

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

async function makeRequestGooglePlaces(query: string, location: SiteLocation, radius: number = 100000) { // 100 km
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

        //filter only the places which are in Asturias
        data.results = data.results.filter((place) => {
            return place.formatted_address.toLocaleLowerCase().includes('asturias');
        });

        return data;
    } catch (error: any) {
        throw new Error(`Ocurrió un error en la petición a Google Places: ${error.message}`);
    }
}

export const handleGetLocationByLink = async (link: string) => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.goto(link);


}

export const handleScrapGoogleMaps = async (query: string) => {
    const browser = await puppeteer.launch({
        args: [
            ...chromium.args,
        ],
        executablePath: await chromium.executablePath,  // Ruta al binario de Chromium
        headless: true,  // Asegura que se ejecute en modo sin interfaz gráfica
    });

    //sustituir espacios por +
    query = query.replace(' ', '+');
    const url = 'https://www.google.com/maps/search/'.concat(query) + '?hl=es';

    const page = await browser.newPage();

    await page.goto(url);

    // const cookiesLoaded = await loadCookiesFromFile(page, COOKIES_FILE_PATH);

    // Selector que encuentra un div con un aria-label que contiene la palabra clave
    const selectorResultList = '.Nv2PK';
    const selectorAcceptCookies = '[aria-label*="Aceptar todo"]';

    // if (!cookiesLoaded || cookiesLoaded.length === 0 || areCookiesExpired(cookiesLoaded).hasExpired) {
    // console.log("first time");
    // Espera a que el botón de rechazo de cookies sea detectable
    await page.waitForSelector(selectorAcceptCookies, { timeout: 5000 });

    // Hace clic en el botón de rechazo de cookies
    await page.click(selectorAcceptCookies);

    // Guardar cookies en un archivo
    // await saveCookiesToFile(page, COOKIES_FILE_PATH);

    // Espera a que cualquier redirección potencial o recarga de la página termine
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    // }
    // console.log("cookies loaded");
    const sitesData = await page.evaluate((selector: any) => {
        const elements = Array.from(document.querySelectorAll(selector));

        return elements.map(el => {
            const nombre = el.querySelector('.qBF1Pd')?.textContent || '';
            let direccion = el.querySelector('.W4Efsd .W4Efsd > span:nth-child(3)')?.textContent || '';
            const tipo = el.querySelector('.W4Efsd .W4Efsd > span > span')?.textContent || '';
            const calificacionGoogle = el.querySelector('.MW4etd')?.textContent || '0';
            const link = el.querySelector('.hfpxzc')?.getAttribute('href') || '';

            // Eliminar todos los " . " de la dirección
            direccion = direccion.replace(' · ', '').trim();

            // Extraer latitud y longitud del enlace usando !3d para latitud y !4d para longitud
            const latitudRegex = /!3d(-?\d+(\.\d+)?)/;
            const longitudRegex = /!4d(-?\d+(\.\d+)?)/;

            const latitudMatch = link.match(latitudRegex);
            const longitudMatch = link.match(longitudRegex);

            const latitud = latitudMatch ? parseFloat(latitudMatch[1]) : null;
            const longitud = longitudMatch ? parseFloat(longitudMatch[1]) : null;

            // Crear el objeto location si se encuentran coordenadas
            const location = (latitud !== null && longitud !== null) ? { latitud, longitud } : undefined;

            return {
                nombre,
                direccion,
                calificacionGoogle: parseFloat(calificacionGoogle),
                tipos: [tipo],
                link,
                location
            };
        });
    }, selectorResultList);

    // Crear instancias de ScrappedSite con los datos recolectados.
    const sites = sitesData.map((siteData: any) => new ScrappedSite(
        siteData.nombre,
        siteData.direccion,
        siteData.calificacionGoogle,
        siteData.tipos,
        siteData.link,
        siteData.location,    // Se pasa el objeto de ubicación (latitud, longitud)
        siteData.calificacionGoogle, // Se usa calificacionGoogle también para rating
        siteData.tipos        // Se pasa la lista de tipos dos veces (types y tipos)
    ));

    await browser.close();

    return sites;
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


const areCookiesExpired = (cookies: Array<any>) => {
    const now = Date.now(); // Obtiene la hora actual en milisegundos
    const expiredCookies = cookies.filter(cookie => {
        // Verifica si la cookie tiene un campo de expiración y si ha expirado
        return cookie.expires && cookie.expires < now;
    });

    // Devuelve un objeto que contiene el estado y las cookies expiradas
    return {
        hasExpired: expiredCookies.length > 0,
        expiredCookies: expiredCookies,
    };
};

async function saveCookiesToFile(page: Page, filePath: string) {
    try {
        // Getting the cookies from the current page
        const cookies = await page.cookies();

        // Writing the cookies to a file as JSON
        const fs = require('fs');
        fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));

        // Cookies have been saved successfully
        return true;
    } catch (error) {
        // An error occurred while saving cookies
        console.error('Error saving cookies:', error);
        return false;
    }
}
async function loadCookiesFromFile(page: Page, filePath: string) {
    try {
        // Check if the cookies file exists
        if (!fs.existsSync(filePath)) {
            // If the file does not exist, create an empty cookies array and write it to the file
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            console.log('Archivo de cookies creado:', filePath);
        }

        // Reading cookies from the specified file
        const cookiesJson = fs.readFileSync(filePath, 'utf-8');
        const cookies = JSON.parse(cookiesJson);

        // Setting the cookies in the current page
        await page.setCookie(...cookies);
        console.log('Cookies cargadas correctamente:', cookies);
        return cookies;
    } catch (error) {
        // An error occurred while loading cookies
        console.error('Error al cargar las cookies:', error);
        return null;
    }
}