import { Response } from "express"

const handleHttp = (res: Response, errorMessage?: string, status?: number) => {
    console.error(errorMessage)
    res.status(status || 500).send({ msg : errorMessage } || { msg: "Error en el servidor" })
};

export { handleHttp }