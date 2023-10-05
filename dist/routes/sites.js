"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sitiosController_1 = require("../controllers/sitiosController");
const clientConvert_1 = require("../middleware/clientConvert");
const router = (0, express_1.Router)();
router.get("/", sitiosController_1.sitesIndexController);
router.get("/close", sitiosController_1.getClosePlacesController, clientConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments", sitiosController_1.getCommentsController);
router.post("/comment", sitiosController_1.postCommentController);
router.put("/comment/:placeId", sitiosController_1.editCommentController);
router.delete("/comment/:placeId/:commentId", sitiosController_1.deleteCommentController); //Meterle middleware de transformacion de sitio
router.post("/review", sitiosController_1.postReviewController); //Meterle middleware de transformacion de sitio
router.put("/review/:reviewId", sitiosController_1.editReviewController); //Meterle middleware de transformacion de sitio
router.delete("/review/:reviewId", sitiosController_1.deleteReviewController); //Meterle middleware de transformacion de sitio
exports.default = router;
