"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsiquicaEnum = exports.SensorialEnum = exports.FisicaEnum = void 0;
// Defining enums from the provided keys
var FisicaEnum;
(function (FisicaEnum) {
    FisicaEnum["entrada"] = "entrada";
    FisicaEnum["taza_bano"] = "taza_bano";
    FisicaEnum["rampas"] = "rampas";
    FisicaEnum["ascensores"] = "ascensores";
    FisicaEnum["pasillos"] = "pasillos";
    FisicaEnum["banos_adaptados"] = "banos_adaptados";
    FisicaEnum["senaletica_clara"] = "senaletica_clara";
})(FisicaEnum || (exports.FisicaEnum = FisicaEnum = {}));
var SensorialEnum;
(function (SensorialEnum) {
    SensorialEnum["senaletica_braille"] = "senaletica_braille";
    SensorialEnum["sistemas_amplificacion"] = "sistemas_amplificacion";
    SensorialEnum["iluminacion_adecuada"] = "iluminacion_adecuada";
    SensorialEnum["informacion_accesible"] = "informacion_accesible";
    SensorialEnum["pictogramas_claros"] = "pictogramas_claros";
})(SensorialEnum || (exports.SensorialEnum = SensorialEnum = {}));
var PsiquicaEnum;
(function (PsiquicaEnum) {
    PsiquicaEnum["informacion_simple"] = "informacion_simple";
    PsiquicaEnum["senaletica_intuitiva"] = "senaletica_intuitiva";
    PsiquicaEnum["espacios_tranquilos"] = "espacios_tranquilos";
    PsiquicaEnum["interaccion_personal"] = "interaccion_personal";
})(PsiquicaEnum || (exports.PsiquicaEnum = PsiquicaEnum = {}));
