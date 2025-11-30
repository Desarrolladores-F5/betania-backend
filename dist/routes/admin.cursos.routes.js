"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.cursos.routes.ts
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const curso_controller_1 = require("../controllers/curso.controller");
// ⬇️ IMPORTA el handler de módulos por curso
const modulo_controller_1 = require("../controllers/modulo.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireAdmin);
router.get("/", curso_controller_1.listarCursosAdmin);
router.post("/", curso_controller_1.crearCurso);
router.get("/:id", curso_controller_1.obtenerCursoAdmin);
router.put("/:id", curso_controller_1.actualizarCurso);
router.delete("/:id", curso_controller_1.eliminarCurso);
// ⬇️ AGREGA la ruta anidada de módulos del curso
router.get("/:cursoId/modulos", modulo_controller_1.listarModulosPorCurso);
exports.default = router;
