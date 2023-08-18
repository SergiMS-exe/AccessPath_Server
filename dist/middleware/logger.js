"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMiddleware = void 0;
const fs_1 = __importDefault(require("fs"));
const logMiddleware = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        const logTime = new Date().toLocaleTimeString();
        const log = `${logTime}\t${req.method} on path: ${req.path}\n\tStatus: ${res.statusCode}, Response:\n${body}\n`;
        console.log(log);
        fs_1.default.appendFile('log.txt', log, (err) => {
            if (err) {
                console.error('Failed to write to file', err);
            }
        });
        return originalSend.apply(this, [body]);
    };
    next();
};
exports.logMiddleware = logMiddleware;
