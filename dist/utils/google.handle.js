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
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const ScrappedSite_1 = require("../interfaces/ScrappedSite");
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
        args: [
            ...chrome_aws_lambda_1.default.args,
            '--lang=es-ES'
        ],
        executablePath: yield chrome_aws_lambda_1.default.executablePath, // Ruta al binario de Chromium
        headless: true, // Asegura que se ejecute en modo sin interfaz gráfica
    });
    const page = yield browser.newPage();
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
    yield page.goto(url);
    // Selector que encuentra un div con un aria-label que contiene la palabra clave
    const selectorResultList = '.Nv2PK';
    const selectorRejectCookies = '[aria-label*="Rechazar todo"]';
    // Espera a que el botón de rechazo de cookies sea detectable
    yield page.waitForSelector(selectorRejectCookies, { timeout: 10000 });
    // Hace clic en el botón de rechazo de cookies
    yield page.click(selectorRejectCookies);
    // Espera a que cualquier redirección potencial o recarga de la página termine
    yield page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    const sitesData = yield page.evaluate((selector) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.map(el => {
            var _a, _b, _c, _d, _e;
            const nombre = ((_a = el.querySelector('.qBF1Pd')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            const direccion = ((_b = el.querySelector('.W4Efsd .W4Efsd span:nth-of-type(2) span:nth-of-type(2)')) === null || _b === void 0 ? void 0 : _b.textContent) || '';
            const tipo = ((_c = el.querySelector('.W4Efsd .W4Efsd > span > span')) === null || _c === void 0 ? void 0 : _c.textContent) || '';
            const rating = ((_d = el.querySelector('.MW4etd')) === null || _d === void 0 ? void 0 : _d.textContent) || '0';
            const link = ((_e = el.querySelector('.hfpxzc')) === null || _e === void 0 ? void 0 : _e.getAttribute('href')) || '';
            return { nombre, direccion, rating: parseFloat(rating), tipos: [tipo], link };
        });
    }, selectorResultList);
    // Ahora, fuera de page.evaluate, crea instancias de ScrappedSite con los datos recolectados.
    const sites = sitesData.map((siteData) => new ScrappedSite_1.ScrappedSite(siteData.nombre, siteData.direccion, siteData.rating, siteData.tipos, siteData.link));
    console.log(sites);
    yield browser.close();
    return sites;
});
exports.handleScrapGoogleMaps = handleScrapGoogleMaps;
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
