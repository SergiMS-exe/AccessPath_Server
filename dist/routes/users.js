"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const locationConvert_1 = require("../middleware/locationConvert");
const router = (0, express_1.Router)();
router.get("/", usersController_1.usersIndexController);
router.post("/login", usersController_1.logInUserController);
router.post("/register", usersController_1.registerUserController);
router.put("/password/:userId", usersController_1.editPasswordController);
router.put("/saveSite", locationConvert_1.convertToServerMiddleware, usersController_1.saveSiteController);
router.put("/unsaveSite", usersController_1.unsaveSiteController);
router.get("/savedSites/:userId", usersController_1.getSavedSitesController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments/:userId", usersController_1.getUserCommentsController, locationConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/ratings/:userId", usersController_1.getUserRatingsController, locationConvert_1.convertValoracionSiteMiddleware);
router.delete("/:userId", usersController_1.deleteUserController);
router.put("/:userId", usersController_1.editUserController);
exports.default = router;
