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
    postPhotoController,
} from "../controllers/sitiosController";
import { convertToClientMiddleware } from "../middleware/locationConvert";

const router = Router();

router.get("/", sitesIndexController);
router.get("/close", getClosePlacesController, convertToClientMiddleware) //Meterle middleware de transformacion de array de sitios
router.get("/comments", getCommentsController)
router.post("/comment", postCommentController);
router.put("/comment/:placeId", editCommentController);
router.delete("/comment/:placeId/:commentId", deleteCommentController);
router.post("/review", postReviewController, convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.put("/review/:reviewId", editReviewController, convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.delete("/review/:reviewId", deleteReviewController, convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.post("/photo", postPhotoController, convertToClientMiddleware);

export default router