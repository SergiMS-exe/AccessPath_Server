"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sitiosController_1 = require("../controllers/sitiosController");
const locationConvert_1 = require("../middleware/locationConvert");
const multer_1 = __importDefault(require("../config/multer"));
const router = (0, express_1.Router)();
router.get("/", sitiosController_1.sitesIndexController);
router.get("/close", sitiosController_1.getClosePlacesController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments", sitiosController_1.getCommentsController);
router.post("/comment", sitiosController_1.postCommentController);
router.put("/comment/:placeId", sitiosController_1.editCommentController);
router.delete("/comment/:placeId/:commentId", sitiosController_1.deleteCommentController);
router.post("/review", sitiosController_1.postReviewController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.put("/review/:reviewId", sitiosController_1.editReviewController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.delete("/review/:reviewId", sitiosController_1.deleteReviewController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de sitio
router.post("/photo", multer_1.default.single("photo"), sitiosController_1.postPhotoController, locationConvert_1.convertToClientMiddleware);
exports.default = router;
