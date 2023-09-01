"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const logger_1 = require("../middleware/logger");
const router = (0, express_1.Router)();
exports.router = router;
router.get("/", usersController_1.usersIndexController);
router.post("/login", logger_1.logMiddleware, usersController_1.logInUserController);
router.post("/register", usersController_1.registerUserController);
router.delete("/:userId", usersController_1.deleteUserController);
router.put("/saveSite", usersController_1.saveSiteController);
router.put("/unsaveSite", usersController_1.unsaveSiteController);
router.get("/savedSites/:userId", usersController_1.getSavedSitesController);
