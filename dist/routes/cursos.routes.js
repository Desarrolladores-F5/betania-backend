"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/cursos.routes.ts
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const curso_controller_1 = require("../controllers/curso.controller");
const leccion_controller_1 = require("../controllers/leccion.controller");
const modulo_controller_1 = require("../controllers/modulo.controller");
const examen_controller_1 = require("../controllers/examen.controller");
const router = (0, express_1.Router)();
// Todas las rutas de cursos requieren usuario autenticado
router.use(auth_1.requireAuth);
/**
 * ⚠ Importante: primero las rutas "fijas" y más específicas,
 * luego las rutas con parámetros genéricos como "/:id".
 */
// Lista de cursos disponibles para el alumno
router.get("/", curso_controller_1.listarCursosPublico);
// Ver contenido de un módulo (alumno) con sus lecciones y progreso
router.get("/:cursoId/modulos/:moduloId", modulo_controller_1.obtenerModuloAlumno);
// Ver una lección individual
router.get("/leccion/:id", leccion_controller_1.obtenerLeccionPublica);
// Obtener la prueba asociada a una lección (alumno)
router.get("/leccion/:id/prueba", examen_controller_1.obtenerPruebaLeccionUsuario);
// ✅ Enviar respuestas de la prueba de la lección (alumno)
router.post("/leccion/:id/prueba/responder", examen_controller_1.responderPruebaLeccion);
// Detalle del curso (módulos, etc.)
router.get("/:id", curso_controller_1.obtenerCursoConContenido);
exports.default = router;
