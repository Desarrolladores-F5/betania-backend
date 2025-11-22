import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";

import {
  crearExamen,
  actualizarExamen,
  obtenerExamenCompleto,
  eliminarExamen,
  listarExamenes,
  actualizarExamenCompleto,   // ← ✔️ IMPORTANTE
} from "../controllers/examen.controller";

import {
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta,
} from "../controllers/pregunta.controller";

import {
  crearAlternativa,
  actualizarAlternativa,
  eliminarAlternativa,
} from "../controllers/alternativa.controller";

const router = Router();

// Todas las rutas requieren autenticación + admin
router.use(requireAuth, requireAdmin);

/* ===========================================================
   EXÁMENES
   =========================================================== */

// Listar todos los exámenes
router.get("/", listarExamenes);

// Crear examen
router.post("/", crearExamen);

// Obtener examen completo con preguntas + alternativas
router.get("/:id", obtenerExamenCompleto);

// Actualizar SOLO datos generales del examen
router.put("/:id", actualizarExamen);

// 🔥 NUEVO: Actualizar examen COMPLETO (con preguntas + alternativas)
router.put("/:id/full", actualizarExamenCompleto); // ← ✔️ AGREGADA

// Eliminar examen
router.delete("/:id", eliminarExamen);

/* ===========================================================
   PREGUNTAS
   =========================================================== */

router.post(
  "/:examen_id/preguntas",
  (req, res, next) => {
    req.body.examen_id = Number(req.params.examen_id);
    next();
  },
  crearPregunta
);

router.put("/preguntas/:id", actualizarPregunta);
router.delete("/preguntas/:id", eliminarPregunta);

/* ===========================================================
   ALTERNATIVAS
   =========================================================== */

router.post(
  "/preguntas/:pregunta_id/alternativas",
  (req, res, next) => {
    req.body.pregunta_id = Number(req.params.pregunta_id);
    next();
  },
  crearAlternativa
);

router.put("/alternativas/:id", actualizarAlternativa);
router.delete("/alternativas/:id", eliminarAlternativa);

export default router;
