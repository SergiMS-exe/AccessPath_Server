import { Router } from "express";
import { deleteCommentController, editCommentController, getCommentsController, postCommentController, sitesIndexController } from "../controllers/sitiosController";

const router = Router();

router.get("/", sitesIndexController);
router.get("/comments", getCommentsController)
router.post("/comment", postCommentController);
router.put("/comment/:placeId", editCommentController);
router.delete("/comment/:placeId/:commentId", deleteCommentController);

export default router