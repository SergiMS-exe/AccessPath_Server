export interface Valoracion {
    placeId?: string;
    userId?: string;
    fisica?: Record<FisicaKey, number>;
    sensorial?: Record<SensorialKey, number>;
    psiquica?: Record<PsiquicaKey, number>;

}

export enum FisicaEnum {
    entrada = 'entrada',
    taza_bano = 'taza_bano',
    rampas = 'rampas',
    ascensores = 'ascensores',
    pasillos = 'pasillos',
    banos_adaptados = 'banos_adaptados',
    senaletica_clara = 'senaletica_clara'
}

export enum SensorialEnum {
    senaletica_braille = 'senaletica_braille',
    sistemas_amplificacion = 'sistemas_amplificacion',
    iluminacion_adecuada = 'iluminacion_adecuada',
    informacion_accesible = 'informacion_accesible',
    pictogramas_claros = 'pictogramas_claros'
}

export enum PsiquicaEnum {
    informacion_simple = 'informacion_simple',
    senaletica_intuitiva = 'senaletica_intuitiva',
    espacios_tranquilos = 'espacios_tranquilos',
    interaccion_personal = 'interaccion_personal'
}

export enum TypesOfDisabilities {
    fisica = 'Física',
    sensorial = 'Sensorial',
    psiquica = 'Psíquica',
    ninguna = 'Ninguna'
}

export type TypesOfDisabilitiesKey = keyof typeof TypesOfDisabilities;

export type FisicaKey = keyof typeof FisicaEnum;
export type SensorialKey = keyof typeof SensorialEnum;
export type PsiquicaKey = keyof typeof PsiquicaEnum;
