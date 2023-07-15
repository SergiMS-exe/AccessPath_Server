import { Response } from "express"

const handleHttp = (res: Response, errorMessage?: string, status?: number) => {
    res.status(status || 500).send({ errorMessage } || { errorMessage: "Error en el servidor" })
};

export { handleHttp }