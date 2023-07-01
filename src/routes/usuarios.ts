import { Router } from "express"
import { logInUserController, registerUserController } from "../controllers/usersController";

const router = Router();

router.post("/login", logInUserController);
router.post("/register", registerUserController)
router.post("/saveSite", registerUserController)
router.post("/unsaveSite", registerUserController)

export { router };
