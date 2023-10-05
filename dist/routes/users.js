"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const logger_1 = require("../middleware/logger");
const clientConvert_1 = require("../middleware/clientConvert");
const router = (0, express_1.Router)();
router.get("/", usersController_1.usersIndexController);
router.post("/login", logger_1.logMiddleware, usersController_1.logInUserController);
router.post("/register", usersController_1.registerUserController);
router.put("/:userId", usersController_1.editUserController);
router.put("/password/:userId", usersController_1.editPasswordController);
router.delete("/:userId", usersController_1.deleteUserController);
router.put("/saveSite", usersController_1.saveSiteController);
router.put("/unsaveSite", usersController_1.unsaveSiteController);
router.get("/savedSites/:userId", usersController_1.getSavedSitesController, clientConvert_1.convertToClientMiddleware); //Meterle middleware de transformacion de array de sitios
router.get("/comments/:userId", usersController_1.getUserCommentsController); //Meterle middleware de transformacion de array de sitios
exports.default = router;
