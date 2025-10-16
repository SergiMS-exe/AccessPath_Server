import "dotenv/config";
import { Site, SiteLocation } from "../interfaces/Site";
import puppeteer, { Page } from "puppeteer";
import fs from 'fs';
import chromium from "chrome-aws-lambda";
import * as pluscodes from "pluscodes";
import { ScrappedSite } from "../interfaces/ScrappedSite";
import { get } from "http";

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
        headless: true, // Para que no abra la ventana del navegador
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
            ...chromium?.args || []
        ],
        // executablePath: '/usr/bin/chromium-browser'// await chromium.executablePath, // usa esto solo si sabes que chromium.executablePath existe
    });


    // Reemplazar espacios por '+'
    query = query.replace(' ', '+');
    const url = 'https://www.google.com/maps/search/'.concat(query) + '?hl=es';

    const page = await browser.newPage();
    await page.goto(url);

    const selectorResultList = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde.ecceSd';  // Selector para lista de resultados múltiples
    const selectorSingleResult = '#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div';  // Selector para un solo resultado
    const selectorAcceptCookies = '[aria-label*="Aceptar todo"]';

    // Espera y clic en el botón de aceptación de cookies
    await page.waitForSelector(selectorAcceptCookies, { timeout: 5000 });
    await page.click(selectorAcceptCookies);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Espera a que cargue alguno de los selectores de resultados
    const winner = await Promise.race([
        page.waitForSelector(selectorResultList, { timeout: 15000 }).then(() => "list").catch(() => null),
        page.waitForSelector(selectorSingleResult, { timeout: 15000 }).then(() => "single").catch(() => null)
    ]);

    // Intentamos obtener una lista de resultados múltiples
    let sitesData;

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    if (winner === "list") {
        sitesData = await page.evaluate((selector) => {
            const elements = Array.from(document.querySelectorAll(`${selector} .Nv2PK.THOPZb`));
            if (elements.length === 0) return null;
            
            return elements.map(el => {
                const nombre = el.querySelector('.qBF1Pd')?.textContent?.trim() || '';
                const direccion = el.querySelector('.W4Efsd .W4Efsd > span:last-child > span:last-child')?.textContent?.replace(/^·\s*/, '').trim() || '';
                const tipo = el.querySelector('.W4Efsd .W4Efsd > span:first-child')?.textContent?.trim() || '';
                const calificacionGoogle = parseFloat(el.querySelector('.MW4etd')?.textContent?.replace(',', '.') || '0');
                const link = el.closest('.Nv2PK.THOPZb')?.querySelector('a.hfpxzc')?.getAttribute('href') || '';
                
                const latitudMatch = link?.match(/!3d(-?\d+(\.\d+)?)/);
                const longitudMatch = link?.match(/!4d(-?\d+(\.\d+)?)/);
                const location = latitudMatch && longitudMatch ? { latitude: parseFloat(latitudMatch[1]), longitude: parseFloat(longitudMatch[1]) } : undefined;

                return {
                    nombre,
                    direccion,
                    calificacionGoogle,
                    tipos: [tipo],
                    link,
                    location
                };
            });
        }, selectorResultList);
        
    }
    else if (winner === "single") {
        // Si no hay resultados múltiples, intentar extraer un único resultado
        await page.waitForTimeout(4000); //Se espera porque el link y coordenadas se sacan de la URL que tarda un poco en actualizarse
        sitesData = await page.evaluate((selector: any) => {
            const el = document.querySelector(selector);
            if (!el) return null;  // No hay un solo resultado
            const nombre = el.querySelector('h1.DUwDvf.lfPIob')?.textContent || '';
            let direccion = el.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.textContent.trim() || '';
            const tipo = el.querySelector('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div.TIHn2 > div > div.lMbq3e > div.LBgpqf > div > div:nth-child(2) > span:nth-child(1) > span > button')?.textContent || '';
            const calificacionGoogle = el.querySelector('.MW4etd')?.textContent || '0';
            
            direccion = direccion.replace(' · ', '').trim();
            
            return [{
                nombre,
                direccion,
                calificacionGoogle: parseFloat(calificacionGoogle),
                tipos: [tipo],
                link: '',
                location: undefined as SiteLocation | undefined
            }];
        }, selectorSingleResult);
        // Obtener la URL actual para extraer el link y las coordenadas
        const currentUrl = page.url();
        if (sitesData && sitesData.length > 0) {
            sitesData[0].link = currentUrl;
            sitesData[0].location = getLocationFromLink(currentUrl);
        }
    }


    // Si no hay datos en absoluto, devuelve un array vacío
    if (!sitesData) {
        await browser.close();
        return [];
    }

    // Crear instancias de ScrappedSite con los datos recolectados
    const sites = sitesData.map((siteData: any) => new ScrappedSite(
        siteData.nombre,
        siteData.direccion,
        siteData.calificacionGoogle,
        siteData.tipos,
        siteData.link,
        siteData.location
    ));

    await browser.close();

    return sites;
};

function getLocationFromLink(link: string): SiteLocation | undefined {
    const latMatch = link.match(/!3d(-?\d+(\.\d+)?)/);
    const lngMatch = link.match(/!4d(-?\d+(\.\d+)?)/);
    if (latMatch && lngMatch) {
        return {
            latitude: parseFloat(latMatch[1]),
            longitude: parseFloat(lngMatch[1])
        };
    }
    return undefined;
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