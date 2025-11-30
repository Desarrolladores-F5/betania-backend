// src/routes/cursos.routes.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  listarCursosPublico,
  obtenerCursoConContenido,
} from "../controllers/curso.controller";
import { obtenerLeccionPublica } from "../controllers/leccion.controller";
import { obtenerModuloAlumno } from "../controllers/modulo.controller";
import {
  obtenerPruebaLeccionUsuario,
  responderPruebaLeccion,        // ✅ nuevo import
} from "../controllers/examen.controller";

const router = Router();

// Todas las rutas de cursos requieren usuario autenticado
router.use(requireAuth);

/**
 * ⚠ Importante: primero las rutas "fijas" y más específicas,
 * luego las rutas con parámetros genéricos como "/:id".
 */

// Lista de cursos disponibles para el alumno
router.get("/", listarCursosPublico);

// Ver contenido de un módulo (alumno) con sus lecciones y progreso
router.get("/:cursoId/modulos/:moduloId", obtenerModuloAlumno);

// Ver una lección individual
router.get("/leccion/:id", obtenerLeccionPublica);

// Obtener la prueba asociada a una lección (alumno)
router.get("/leccion/:id/prueba", obtenerPruebaLeccionUsuario);

// ✅ Enviar respuestas de la prueba de la lección (alumno)
router.post("/leccion/:id/prueba/responder", responderPruebaLeccion);

// Detalle del curso (módulos, etc.)
router.get("/:id", obtenerCursoConContenido);

export default router;
