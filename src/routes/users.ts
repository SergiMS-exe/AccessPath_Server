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
    editPasswordController,
    getUserRatingsController,
    getUserPhotosController
} from "../controllers/usersController";
import { convertToClientMiddleware, convertToServerMiddleware, convertValoracionSiteMiddleware } from "../middleware/locationConvert";

const router = Router();

router.get("/", usersIndexController);
router.post("/login", logInUserController);
router.post("/register", registerUserController);
router.put("/password/:userId", editPasswordController);
router.put("/saveSite", convertToServerMiddleware, saveSiteController);
router.put("/unsaveSite", unsaveSiteController);
router.get("/savedSites/:userId", getSavedSitesController, convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments/:userId", getUserCommentsController, convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/ratings/:userId", getUserRatingsController, convertValoracionSiteMiddleware);
router.get("/photos/:userId", getUserPhotosController, convertToClientMiddleware);
router.delete("/:userId", deleteUserController);
router.put("/:userId", editUserController);

export default router;
