import { Router } from "express";
import { deleteCommentController, editCommentController, getCommentsController, postCommentController } from "../controllers/sitiosController";

const router = Router();

router.get("/comments", getCommentsController)
router.post("/comment", postCommentController);
router.put("/comment/:id", editCommentController);
router.delete("/comment/:id", deleteCommentController);

export { router }