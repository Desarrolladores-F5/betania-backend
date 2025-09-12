import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { crearExamen, actualizarExamen, obtenerExamenCompleto, eliminarExamen } from "../controllers/examen.controller";
import { crearPregunta, actualizarPregunta, eliminarPregunta } from "../controllers/pregunta.controller";
import { crearAlternativa, actualizarAlternativa, eliminarAlternativa } from "../controllers/alternativa.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

// Examen
router.post("/", crearExamen);
router.get("/:id", obtenerExamenCompleto);
router.put("/:id", actualizarExamen);
router.delete("/:id", eliminarExamen);

// Preguntas
router.post("/:examen_id/preguntas", (req, res, next) => {
  req.body.examen_id = Number(req.params.examen_id);
  next();
}, crearPregunta);

router.put("/preguntas/:id", actualizarPregunta);
router.delete("/preguntas/:id", eliminarPregunta);

// Alternativas
router.post("/preguntas/:pregunta_id/alternativas", (req, res, next) => {
  req.body.pregunta_id = Number(req.params.pregunta_id);
  next();
}, crearAlternativa);

router.put("/alternativas/:id", actualizarAlternativa);
router.delete("/alternativas/:id", eliminarAlternativa);

export default router;
