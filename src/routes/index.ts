import { Router } from "express";
import { readdirSync } from "fs"
import { dummyController } from "../controllers/usersController";

const PATH_ROUTER = `${__dirname}`;
const router = Router();

const cleanFileName = (fileName: string) => {
    const file = fileName.split(".").shift();
    return file;
}

router.get('/', dummyController)

readdirSync(PATH_ROUTER).filter((fileName) => {
    const cleanName = cleanFileName(fileName);
    if (cleanName !== "index")
        import(`./${cleanName}`).then((moduleRouter) => {
            router.use(`/${cleanName}`, moduleRouter.router)
        })
})

export { router } 