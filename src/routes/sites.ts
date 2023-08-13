import { Router } from "express";
import { deleteCommentController, editCommentController, getCommentsController, postCommentController } from "../controllers/sitiosController";

const router = Router();

router.get("/comments", getCommentsController)
router.post("/comment", postCommentController);
router.put("/comment/:placeId", editCommentController);
router.delete("/comment/:placeId/:commentId", deleteCommentController);

export { router }