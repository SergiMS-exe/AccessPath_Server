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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleScrapGoogleMaps = exports.handleGetLocationByLink = exports.handleFindSitesByTextGoogle = void 0;
require("dotenv/config");
const Site_1 = require("../interfaces/Site");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const ScrappedSite_1 = require("../interfaces/ScrappedSite");
const COOKIES_FILE_PATH = './cookies.json'; // Archivo donde se guarda la sesión (cookies y localStorage)
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
function makeRequestGooglePlaces(query_1, location_1) {
    return __awaiter(this, arguments, void 0, function* (query, location, radius = 100000) {
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
const handleGetLocationByLink = (link) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({});
    const page = yield browser.newPage();
    yield page.goto(link);
});
exports.handleGetLocationByLink = handleGetLocationByLink;
const handleScrapGoogleMaps = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({
        headless: false, // Para que no abra la ventana del navegador
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
            ...(chrome_aws_lambda_1.default === null || chrome_aws_lambda_1.default === void 0 ? void 0 : chrome_aws_lambda_1.default.args) || []
        ],
        // executablePath: '/usr/bin/chromium-browser'// await chromium.executablePath, // usa esto solo si sabes que chromium.executablePath existe
    });
    // Reemplazar espacios por '+'
    query = query.replace(' ', '+');
    const url = 'https://www.google.com/maps/search/'.concat(query) + '?hl=es';
    const page = yield browser.newPage();
    yield page.goto(url);
    const selectorResultList = '.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde.ecceSd'; // Selector para lista de resultados múltiples
    const selectorSingleResult = '#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div'; // Selector para un solo resultado
    const selectorAcceptCookies = '[aria-label*="Aceptar todo"]';
    // Espera y clic en el botón de aceptación de cookies
    yield page.waitForSelector(selectorAcceptCookies, { timeout: 5000 });
    yield page.click(selectorAcceptCookies);
    yield page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    // Espera a que cargue alguno de los selectores de resultados
    const winner = yield Promise.race([
        page.waitForSelector(selectorResultList, { timeout: 15000 }).then(() => "list").catch(() => null),
        page.waitForSelector(selectorSingleResult, { timeout: 15000 }).then(() => "single").catch(() => null)
    ]);
    // Intentamos obtener una lista de resultados múltiples
    let sitesData;
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    if (winner === "list") {
        sitesData = yield page.evaluate((selector) => {
            const elements = Array.from(document.querySelectorAll(`${selector} .Nv2PK.THOPZb`));
            if (elements.length === 0)
                return null;
            return elements.map(el => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const nombre = ((_b = (_a = el.querySelector('.qBF1Pd')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                const direccion = ((_d = (_c = el.querySelector('.W4Efsd .W4Efsd > span:last-child > span:last-child')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.replace(/^·\s*/, '').trim()) || '';
                const tipo = ((_f = (_e = el.querySelector('.W4Efsd .W4Efsd > span:first-child')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
                const calificacionGoogle = parseFloat(((_h = (_g = el.querySelector('.MW4etd')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.replace(',', '.')) || '0');
                const link = ((_k = (_j = el.closest('.Nv2PK.THOPZb')) === null || _j === void 0 ? void 0 : _j.querySelector('a.hfpxzc')) === null || _k === void 0 ? void 0 : _k.getAttribute('href')) || '';
                const latitudMatch = link === null || link === void 0 ? void 0 : link.match(/!3d(-?\d+(\.\d+)?)/);
                const longitudMatch = link === null || link === void 0 ? void 0 : link.match(/!4d(-?\d+(\.\d+)?)/);
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
        yield page.waitForTimeout(4000); //Se espera porque el link y coordenadas se sacan de la URL que tarda un poco en actualizarse
        sitesData = yield page.evaluate((selector) => {
            var _a, _b, _c, _d;
            const el = document.querySelector(selector);
            if (!el)
                return null; // No hay un solo resultado
            const nombre = ((_a = el.querySelector('h1.DUwDvf.lfPIob')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            let direccion = ((_b = el.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')) === null || _b === void 0 ? void 0 : _b.textContent.trim()) || '';
            const tipo = ((_c = el.querySelector('#QA0Szd > div > div > div.w6VYqd > div.bJzME.tTVLSc > div > div.e07Vkf.kA9KIf > div > div > div.TIHn2 > div > div.lMbq3e > div.LBgpqf > div > div:nth-child(2) > span:nth-child(1) > span > button')) === null || _c === void 0 ? void 0 : _c.textContent) || '';
            const calificacionGoogle = ((_d = el.querySelector('.MW4etd')) === null || _d === void 0 ? void 0 : _d.textContent) || '0';
            direccion = direccion.replace(' · ', '').trim();
            return [{
                    nombre,
                    direccion,
                    calificacionGoogle: parseFloat(calificacionGoogle),
                    tipos: [tipo],
                    link: '',
                    location: undefined
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
        yield browser.close();
        return [];
    }
    // Crear instancias de ScrappedSite con los datos recolectados
    const sites = sitesData.map((siteData) => new ScrappedSite_1.ScrappedSite(siteData.nombre, siteData.direccion, siteData.calificacionGoogle, siteData.tipos, siteData.link, siteData.location));
    yield browser.close();
    return sites;
});
exports.handleScrapGoogleMaps = handleScrapGoogleMaps;
function getLocationFromLink(link) {
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
const areCookiesExpired = (cookies) => {
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
function saveCookiesToFile(page, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Getting the cookies from the current page
            const cookies = yield page.cookies();
            // Writing the cookies to a file as JSON
            const fs = require('fs');
            fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
            // Cookies have been saved successfully
            return true;
        }
        catch (error) {
            // An error occurred while saving cookies
            console.error('Error saving cookies:', error);
            return false;
        }
    });
}
function loadCookiesFromFile(page, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the cookies file exists
            if (!fs_1.default.existsSync(filePath)) {
                // If the file does not exist, create an empty cookies array and write it to the file
                fs_1.default.writeFileSync(filePath, JSON.stringify([], null, 2));
                console.log('Archivo de cookies creado:', filePath);
            }
            // Reading cookies from the specified file
            const cookiesJson = fs_1.default.readFileSync(filePath, 'utf-8');
            const cookies = JSON.parse(cookiesJson);
            // Setting the cookies in the current page
            yield page.setCookie(...cookies);
            console.log('Cookies cargadas correctamente:', cookies);
            return cookies;
        }
        catch (error) {
            // An error occurred while loading cookies
            console.error('Error al cargar las cookies:', error);
            return null;
        }
    });
}
