import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { listarCursosPublico, obtenerCursoConContenido } from "../controllers/curso.controller";
import { obtenerLeccionPublica } from "../controllers/leccion.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listarCursosPublico);
router.get("/:id", obtenerCursoConContenido);
router.get("/leccion/:id", obtenerLeccionPublica);

export default router;
