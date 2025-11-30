"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.login); // login con cookie
router.get("/me", auth_1.requireAuth, auth_controller_1.me); // validar sesión desde cookie
router.post("/logout", auth_controller_1.logout); // limpiar cookie y cerrar sesión
exports.default = router;
