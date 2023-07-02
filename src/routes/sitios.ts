import { Router } from "express";
import { deleteCommentController, editCommentController, postCommentController } from "../controllers/sitiosController";

const router = Router();

router.post("/comment", postCommentController);
router.put("/comment", editCommentController);
router.delete("/comment", deleteCommentController);