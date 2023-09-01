import { Response } from "express"

const handleHttp = (res: Response, errorMessage?: string, status?: number) => {
    console.error(errorMessage)
    res.status(status || 500).send({ msg : errorMessage } || { msg: "Error en el servidor" })
};

const handle404Error = (res: Response) => {
    res.status(404).send('Error 404: Página no encontrada');
};

export { handleHttp, handle404Error }