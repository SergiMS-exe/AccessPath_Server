import { Router } from "express";
import { dummyController } from "../controllers/usersController";
import userRouter from "./users";
import siteRouter from "./sites";

const router = Router();


router.get('/', dummyController)
router.use('/users', userRouter);
router.use('/sites', siteRouter);

export { router } 