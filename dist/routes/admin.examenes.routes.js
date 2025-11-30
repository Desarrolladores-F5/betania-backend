"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const examen_controller_1 = require("../controllers/examen.controller");
const pregunta_controller_1 = require("../controllers/pregunta.controller");
const alternativa_controller_1 = require("../controllers/alternativa.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación + admin
router.use(auth_1.requireAuth, auth_1.requireAdmin);
/* ===========================================================
   EXÁMENES
   =========================================================== */
// Listar todos los exámenes
router.get("/", examen_controller_1.listarExamenes);
// Crear examen
router.post("/", examen_controller_1.crearExamen);
// Obtener examen completo con preguntas + alternativas
router.get("/:id", examen_controller_1.obtenerExamenCompleto);
// Actualizar SOLO datos generales del examen
router.put("/:id", examen_controller_1.actualizarExamen);
// 🔥 NUEVO: Actualizar examen COMPLETO (con preguntas + alternativas)
router.put("/:id/full", examen_controller_1.actualizarExamenCompleto); // ← ✔️ AGREGADA
// Eliminar examen
router.delete("/:id", examen_controller_1.eliminarExamen);
/* ===========================================================
   PREGUNTAS
   =========================================================== */
router.post("/:examen_id/preguntas", (req, res, next) => {
    req.body.examen_id = Number(req.params.examen_id);
    next();
}, pregunta_controller_1.crearPregunta);
router.put("/preguntas/:id", pregunta_controller_1.actualizarPregunta);
router.delete("/preguntas/:id", pregunta_controller_1.eliminarPregunta);
/* ===========================================================
   ALTERNATIVAS
   =========================================================== */
router.post("/preguntas/:pregunta_id/alternativas", (req, res, next) => {
    req.body.pregunta_id = Number(req.params.pregunta_id);
    next();
}, alternativa_controller_1.crearAlternativa);
router.put("/alternativas/:id", alternativa_controller_1.actualizarAlternativa);
router.delete("/alternativas/:id", alternativa_controller_1.eliminarAlternativa);
exports.default = router;
