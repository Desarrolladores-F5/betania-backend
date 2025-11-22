// src/routes/admin.cursos.routes.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  crearCurso,
  listarCursosAdmin,
  obtenerCursoAdmin,
  actualizarCurso,
  eliminarCurso,
} from "../controllers/curso.controller";

// ⬇️ IMPORTA el handler de módulos por curso
import { listarModulosPorCurso } from "../controllers/modulo.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listarCursosAdmin);
router.post("/", crearCurso);
router.get("/:id", obtenerCursoAdmin);
router.put("/:id", actualizarCurso);
router.delete("/:id", eliminarCurso);

// ⬇️ AGREGA la ruta anidada de módulos del curso
router.get("/:cursoId/modulos", listarModulosPorCurso);

export default router;
