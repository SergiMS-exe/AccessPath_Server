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
    deletePhotoController,
    getPlacesByTextController,
} from "../controllers/sitiosController";
import { convertToClientMiddleware, convertToServerMiddleware } from "../middleware/locationConvert";

const router = Router();

router.get("/", sitesIndexController);
router.get("/close", getClosePlacesController, convertToClientMiddleware);
router.get("/search", getPlacesByTextController, convertToClientMiddleware);
router.get("/search/scrapped",)
router.get("/comments", getCommentsController);
router.post("/comment", convertToServerMiddleware, postCommentController);
router.put("/comment/:placeId", editCommentController);
router.delete("/comment/:placeId/:commentId", deleteCommentController);
router.post("/review", convertToServerMiddleware, postReviewController, convertToClientMiddleware);
router.put("/review/:placeId/:userId", editReviewController, convertToClientMiddleware);
router.delete("/review/:placeId/:userId", deleteReviewController, convertToClientMiddleware);
router.post("/photo", convertToServerMiddleware, postPhotoController, convertToClientMiddleware);
router.delete("/photo/:photoId", deletePhotoController, convertToClientMiddleware);

export default router