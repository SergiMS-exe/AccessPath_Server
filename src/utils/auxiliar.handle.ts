import { Site } from "../interfaces/Site";
import { FisicaEnum, FisicaKey, PsiquicaEnum, PsiquicaKey, SensorialEnum, SensorialKey, TypesOfDisabilities, TypesOfDisabilitiesKey, Valoracion } from "../interfaces/Valoracion";
import SitioModel from "../models/sitioModel";
import ValoracionModel from "../models/valoracionModel";

export function transformArrayToClientFormat(sites: any[]): any[] {
    return sites.map(transformToClientFormat);
}

export function transformValoracionSiteArray(array: { valoracion: Valoracion, site: Site }[]): any[] {
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


export function transformToClientFormat(site: any): any {
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

function checkLocationFormat(location: any): boolean {
    if (location && location.type && location.coordinates && location.type === "Point" && Array.isArray(location.coordinates)) {
        return true;
    }
    return false;
}

export function transformToServerFormat(site: any): any {
    const actualSite = site;  // Accessing the _doc field

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

export function transformToServerFormatArray(sites: any[]): any[] {
    return sites.map(transformToServerFormat);
}

// Actualizacion de las valoraciones de un sitio
export const updateAverages = async (input: Site | string) => {
    let placeId: string;
    let place: Site | undefined = undefined;

    if (typeof input === "string") {
        placeId = input;
    } else {
        placeId = input.placeId;
        place = input;
    }

    const siteFound = await SitioModel.findOne({ placeId: placeId });

    // Busca todas las valoraciones del sitio
    const reviews = await ValoracionModel.find({ placeId: placeId });

    if (!reviews)
        return { error: "No se pudo actualizar el promedio", status: 500 };

    const averages = reviews.length > 0 ? calculateAverages(reviews) : undefined;


    if (!siteFound && averages) {
        if (!place)
            return { error: "No se proporcionó información sobre el sitio", status: 500 };

        const newSite: Site = {
            ...place,
            valoraciones: averages as Valoracion
        };

        const createdSite = new SitioModel(newSite);
        await createdSite.save();
        return { status: 200, newPlace: createdSite };
    }
    if (averages) {
        siteFound!.valoraciones = averages as Valoracion;
    } else {
        siteFound!.valoraciones = undefined;
        siteFound!.markModified('valoraciones');

    }

    await siteFound!.save();
    return { status: 200, newPlace: siteFound!.toObject() };

};

const calculateAverages = (reviews: Valoracion[]) => {
    let fisicaSum = {} as Record<FisicaKey, number>;
    let sensorialSum = {} as Record<SensorialKey, number>;
    let psiquicaSum = {} as Record<PsiquicaKey, number>;

    let fisicaCount = {} as Record<FisicaKey, number>;
    let sensorialCount = {} as Record<SensorialKey, number>;
    let psiquicaCount = {} as Record<PsiquicaKey, number>;

    // Initialize counts and sums to 0
    Object.values(FisicaEnum).forEach(key => {
        fisicaSum[key] = 0;
        fisicaCount[key] = 0;
    });
    Object.values(SensorialEnum).forEach(key => {
        sensorialSum[key] = 0;
        sensorialCount[key] = 0;
    });
    Object.values(PsiquicaEnum).forEach(key => {
        psiquicaSum[key] = 0;
        psiquicaCount[key] = 0;
    });

    for (const review of reviews) {
        for (const key of Object.values(FisicaEnum)) {
            if (review.fisica && review.fisica[key]) {
                fisicaSum[key] += review.fisica[key];
                fisicaCount[key]++;
            }
        }
        for (const key of Object.values(SensorialEnum)) {
            if (review.sensorial && review.sensorial[key]) {
                sensorialSum[key] += review.sensorial[key];
                sensorialCount[key]++;
            }
        }
        for (const key of Object.values(PsiquicaEnum)) {
            if (review.psiquica && review.psiquica[key]) {
                psiquicaSum[key] += review.psiquica[key];
                psiquicaCount[key]++;
            }
        }
    }

    const computeAverageForCategory = (
        sum: Record<string, number>,
        count: Record<string, number>
    ) => {
        let total = 0;
        const valoracion: Record<string, number> = {};

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

    return {
        ...(fisicaResult.average !== undefined ? { fisica: fisicaResult } : {}),
        ...(sensorialResult.average !== undefined ? { sensorial: sensorialResult } : {}),
        ...(psiquicaResult.average !== undefined ? { psiquica: psiquicaResult } : {})
    };
};