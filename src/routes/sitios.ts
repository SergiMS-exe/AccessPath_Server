import { Router } from "express";
import { deleteCommentController, editCommentController, postCommentController } from "../controllers/sitiosController";

const router = Router();

router.post("/comment", postCommentController);
router.put("/comment/:id", editCommentController);
router.delete("/comment/:id", deleteCommentController);

export { router }