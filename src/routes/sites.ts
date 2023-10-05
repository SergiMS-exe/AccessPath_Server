import { Router } from "express";
import {
    deleteCommentController,
    editCommentController,
    getCommentsController,
    postCommentController,
    postReviewController,
    sitesIndexController,
    editReviewController,
    deleteReviewController,
    getClosePlacesController,
} from "../controllers/sitiosController";
import { convertToClientMiddleware } from "../middleware/clientConvert";

const router = Router();

router.get("/", sitesIndexController);
router.get("/close", getClosePlacesController, convertToClientMiddleware) //Meterle middleware de transformacion de array de sitios
router.get("/comments", getCommentsController)
router.post("/comment", postCommentController);
router.put("/comment/:placeId", editCommentController);
router.delete("/comment/:placeId/:commentId", deleteCommentController); //Meterle middleware de transformacion de sitio
router.post("/review", postReviewController); //Meterle middleware de transformacion de sitio
router.put("/review/:reviewId", editReviewController); //Meterle middleware de transformacion de sitio
router.delete("/review/:reviewId", deleteReviewController); //Meterle middleware de transformacion de sitio

export default router