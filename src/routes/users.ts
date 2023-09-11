import { Router } from "express"
import { 
    getSavedSitesController, 
    logInUserController, 
    deleteUserController,
    registerUserController, 
    saveSiteController, 
    unsaveSiteController, 
    usersIndexController,
    getUserCommentsController
} from "../controllers/usersController";
import { logMiddleware } from "../middleware/logger";

const router = Router();

router.get("/", usersIndexController);
router.post("/login", logMiddleware, logInUserController);
router.post("/register", registerUserController);
router.delete("/:userId", deleteUserController);
router.put("/saveSite", saveSiteController);
router.put("/unsaveSite", unsaveSiteController);
router.get("/savedSites/:userId", getSavedSitesController);
router.get("/comments/:userId", getUserCommentsController);

export default router;
