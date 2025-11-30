"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/usuarios.routes.ts
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const admin_usuarios_controller_1 = require("../controllers/admin.usuarios.controller");
const router = (0, express_1.Router)();
// Todas las rutas protegidas para admin
router.use(auth_1.requireAuth, auth_1.requireAdmin);
router.get("/", admin_usuarios_controller_1.listUsuarios);
router.get("/:id", admin_usuarios_controller_1.getUsuario);
router.post("/", admin_usuarios_controller_1.createUsuario);
router.put("/:id", admin_usuarios_controller_1.updateUsuario);
router.delete("/:id", admin_usuarios_controller_1.deleteUsuario);
exports.default = router;
