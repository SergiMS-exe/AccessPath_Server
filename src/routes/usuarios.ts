import { Router } from "express"
import { 
    getSavedSitesController, 
    logInUserController, 
    deleteUserController,
    registerUserController, 
    saveSiteController, 
    unsaveSiteController 
} from "../controllers/usersController";
import { logMiddleware } from "../middleware/logger";

const router = Router();

router.post("/login", logMiddleware, logInUserController);
router.post("/register", registerUserController);
router.delete("/deleteUser/:userId", deleteUserController);
router.post("/saveSite", saveSiteController);
router.post("/unsaveSite", unsaveSiteController);
router.get("/getSavedSites/:userId", getSavedSitesController);

export { router };
