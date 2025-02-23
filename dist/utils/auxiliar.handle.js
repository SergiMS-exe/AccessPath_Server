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
exports.updateAverages = void 0;
exports.transformArrayToClientFormat = transformArrayToClientFormat;
exports.transformValoracionSiteArray = transformValoracionSiteArray;
exports.transformToClientFormat = transformToClientFormat;
exports.transformToServerFormat = transformToServerFormat;
exports.transformToServerFormatArray = transformToServerFormatArray;
const Valoracion_1 = require("../interfaces/Valoracion");
const sitioModel_1 = __importDefault(require("../models/sitioModel"));
const valoracionModel_1 = __importDefault(require("../models/valoracionModel"));
function transformArrayToClientFormat(sites) {
    return sites.map(transformToClientFormat);
}
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
function transformToServerFormatArray(sites) {
    return sites.map(transformToServerFormat);
}
// Actualizacion de las valoraciones de un sitio
const updateAverages = (input) => __awaiter(void 0, void 0, void 0, function* () {
    let placeId;
    let place = undefined;
    if (typeof input === "string") {
        placeId = input;
    }
    else {
        placeId = input.placeId;
        place = input;
    }
    const siteFound = yield sitioModel_1.default.findOne({ placeId: placeId });
    // Busca todas las valoraciones del sitio
    const reviews = yield valoracionModel_1.default.find({ placeId: placeId });
    if (!reviews)
        return { error: "No se pudo actualizar el promedio", status: 500 };
    const averages = reviews.length > 0 ? calculateAverages(reviews) : undefined;
    if (!siteFound && averages) {
        if (!place)
            return { error: "No se proporcionó información sobre el sitio", status: 500 };
        const newSite = Object.assign(Object.assign({}, place), { valoraciones: averages });
        const createdSite = new sitioModel_1.default(newSite);
        yield createdSite.save();
        return { status: 200, newPlace: createdSite };
    }
    if (averages) {
        siteFound.valoraciones = averages;
    }
    else {
        siteFound.valoraciones = undefined;
        siteFound.markModified('valoraciones');
    }
    yield siteFound.save();
    return { status: 200, newPlace: siteFound.toObject() };
});
exports.updateAverages = updateAverages;
const calculateAverages = (reviews) => {
    let fisicaSum = {};
    let sensorialSum = {};
    let psiquicaSum = {};
    let fisicaCount = {};
    let sensorialCount = {};
    let psiquicaCount = {};
    // Initialize counts and sums to 0
    Object.values(Valoracion_1.FisicaEnum).forEach(key => {
        fisicaSum[key] = 0;
        fisicaCount[key] = 0;
    });
    Object.values(Valoracion_1.SensorialEnum).forEach(key => {
        sensorialSum[key] = 0;
        sensorialCount[key] = 0;
    });
    Object.values(Valoracion_1.PsiquicaEnum).forEach(key => {
        psiquicaSum[key] = 0;
        psiquicaCount[key] = 0;
    });
    for (const review of reviews) {
        for (const key of Object.values(Valoracion_1.FisicaEnum)) {
            if (review.fisica && review.fisica[key]) {
                fisicaSum[key] += review.fisica[key];
                fisicaCount[key]++;
            }
        }
        for (const key of Object.values(Valoracion_1.SensorialEnum)) {
            if (review.sensorial && review.sensorial[key]) {
                sensorialSum[key] += review.sensorial[key];
                sensorialCount[key]++;
            }
        }
        for (const key of Object.values(Valoracion_1.PsiquicaEnum)) {
            if (review.psiquica && review.psiquica[key]) {
                psiquicaSum[key] += review.psiquica[key];
                psiquicaCount[key]++;
            }
        }
    }
    const computeAverageForCategory = (sum, count) => {
        let total = 0;
        const valoracion = {};
        let fieldsWithValue = 0;
        for (const key in sum) {
            const averageForKey = count[key] > 0 ? sum[key] / count[key] : 0;
            if (averageForKey > 0) {
                valoracion[key] = parseFloat(averageForKey.toFixed(1));
                total += valoracion[key];
                fieldsWithValue++;
            }
        }
        const average = fieldsWithValue > 0 ? parseFloat((total / fieldsWithValue).toFixed(1)) : undefined;
        return { valoracion, average };
    };
    const fisicaResult = computeAverageForCategory(fisicaSum, fisicaCount);
    const sensorialResult = computeAverageForCategory(sensorialSum, sensorialCount);
    const psiquicaResult = computeAverageForCategory(psiquicaSum, psiquicaCount);
    return Object.assign(Object.assign(Object.assign({}, (fisicaResult.average !== undefined ? { fisica: fisicaResult } : {})), (sensorialResult.average !== undefined ? { sensorial: sensorialResult } : {})), (psiquicaResult.average !== undefined ? { psiquica: psiquicaResult } : {}));
};
