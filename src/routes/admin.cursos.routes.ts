import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { crearCurso, listarCursosAdmin, obtenerCursoAdmin, actualizarCurso, eliminarCurso } from "../controllers/curso.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listarCursosAdmin);
router.post("/", crearCurso);
router.get("/:id", obtenerCursoAdmin);
router.put("/:id", actualizarCurso);
router.delete("/:id", eliminarCurso);

export default router;
