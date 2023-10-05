import { Router } from "express"
import {
    getSavedSitesController,
    logInUserController,
    deleteUserController,
    registerUserController,
    saveSiteController,
    unsaveSiteController,
    usersIndexController,
    getUserCommentsController,
    editUserController,
    editPasswordController
} from "../controllers/usersController";
import { logMiddleware } from "../middleware/logger";
import { convertToClientMiddleware } from "../middleware/clientConvert";

const router = Router();

router.get("/", usersIndexController);
router.post("/login", logMiddleware, logInUserController);
router.post("/register", registerUserController);
router.put("/:userId", editUserController);
router.put("/password/:userId", editPasswordController);
router.delete("/:userId", deleteUserController);
router.put("/saveSite", saveSiteController);
router.put("/unsaveSite", unsaveSiteController);
router.get("/savedSites/:userId", getSavedSitesController, convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments/:userId", getUserCommentsController); //Meterle middleware de transformacion de array de sitios

export default router;
