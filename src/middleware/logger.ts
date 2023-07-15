import e, { NextFunction, Request, Response } from "express";
import fs from "fs";

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body?: any) {
        const logTime = new Date().toLocaleTimeString();
        const log = `${logTime}\t${req.method} on path: ${req.path}\n\tStatus: ${res.statusCode}, Response:\n${body}\n`;

        console.log(log);

        fs.appendFile('log.txt', log, (err) => {
            if (err) {
                console.error('Failed to write to file', err);
            }
        });

        return originalSend.apply(this, [body]);
    };

    next();
};

export { logMiddleware };