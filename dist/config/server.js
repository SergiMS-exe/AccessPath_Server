"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("../app"));
const PORT = process.env.PORT || 3001;
let dbUri = process.env.DB_URI || '';
(0, mongoose_1.connect)(dbUri, {
    dbName: 'AccessPath'
}).then(() => console.log("Conexion a base de datos establecida")).
    catch((e) => console.error("Error en la conexion a base de datos: " + e));
app_1.default.listen(PORT, () => console.log(`Listening on port ${PORT}`));
exports.default = app_1.default;
