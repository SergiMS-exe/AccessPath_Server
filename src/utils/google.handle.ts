import "dotenv/config";
import { Site, SiteLocation } from "../interfaces/Site";
import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import * as pluscodes from "pluscodes";
import { ScrappedSite } from "../interfaces/ScrappedSite";
import e from "express";

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
        args: chromium.args,               // Argumentos optimizados para Lambda
        defaultViewport: chromium.defaultViewport,  // Configuración del viewport
        executablePath: await chromium.executablePath,  // Ruta al binario de Chromium
        headless: chromium.headless,       // Modo sin cabeza (sin interfaz gráfica)
    });
    const page = await browser.newPage();

    //sustituir espacios por +
    query = query.replace(' ', '+');
    const url = 'https://www.google.com/maps/search/'.concat(query);

    // Evita que se carguen las hojas de estilo e imagenes innecesarias
    // await page.setRequestInterception(true);
    // page.on('request', req => {
    //     if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet') {
    //         req.abort();
    //     } else {
    //         req.continue();
    //     }
    // });

    await page.goto(url);

    // Selector que encuentra un div con un aria-label que contiene la palabra clave
    const selectorResultList = '.Nv2PK';
    const selectorRejectCookies = '[aria-label*="Rechazar todo"]';

    // Espera a que el botón de rechazo de cookies sea detectable
    await page.waitForSelector(selectorRejectCookies, { timeout: 10000 });

    // Hace clic en el botón de rechazo de cookies
    await page.click(selectorRejectCookies);

    // Espera a que cualquier redirección potencial o recarga de la página termine
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    const sitesData = await page.evaluate((selector: any) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.map(el => {
            const nombre = el.querySelector('.qBF1Pd')?.textContent || '';
            const direccion = el.querySelector('.W4Efsd .W4Efsd span:nth-of-type(2) span:nth-of-type(2)')?.textContent || '';
            const tipo = el.querySelector('.W4Efsd .W4Efsd > span > span')?.textContent || '';
            const rating = el.querySelector('.MW4etd')?.textContent || '0';
            const link = el.querySelector('.hfpxzc')?.getAttribute('href') || '';
            return { nombre, direccion, rating: parseFloat(rating), tipos: [tipo], link };
        });
    }, selectorResultList);

    // Ahora, fuera de page.evaluate, crea instancias de ScrappedSite con los datos recolectados.
    const sites = sitesData.map((siteData: any) => new ScrappedSite(siteData.nombre, siteData.direccion, siteData.rating, siteData.tipos, siteData.link));

    console.log(sites);

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

