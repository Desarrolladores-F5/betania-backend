"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.modulos.routes.ts
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const modulo_controller_1 = require("../controllers/modulo.controller");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
// Todas las rutas de módulos requieren auth + rol admin
router.use(auth_1.requireAuth, auth_1.requireAdmin);
// Crear módulo (PDF opcional en el campo "pdf_intro")
router.post("/", upload_1.uploadPdf.single("pdf_intro"), modulo_controller_1.crearModulo);
// Listar todos los módulos
router.get("/", modulo_controller_1.listarModulos);
// Obtener un módulo por ID
router.get("/:id", modulo_controller_1.obtenerModuloPorId);
// Actualizar módulo (PDF opcional en el campo "pdf_intro")
router.put("/:id", upload_1.uploadPdf.single("pdf_intro"), modulo_controller_1.actualizarModulo);
// Eliminar módulo
router.delete("/:id", modulo_controller_1.eliminarModulo);
exports.default = router;
