import { Router } from "express"
import { 
    getSavedSitesController, 
    logInUserController, 
    registerUserController, 
    saveSiteController, 
    unsaveSiteController 
} from "../controllers/usersController";

const router = Router();

router.post("/login", logInUserController);
router.post("/register", registerUserController);
router.post("/saveSite", saveSiteController);
router.post("/unsaveSite", unsaveSiteController);
router.get("/getSavedSites", getSavedSitesController);

export { router };
