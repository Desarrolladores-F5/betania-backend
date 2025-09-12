import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { crearIntento, registrarRespuestas, finalizarIntento, listarIntentosUsuario, descargarPDFResultado } from "../controllers/intentoes.controller";

const router = Router();
router.use(requireAuth);

// Intentos
router.post("/:id/intentos", crearIntento);         // id = examen_id
router.post("/intentos/:id/respuestas", registrarRespuestas); // id = intento_id
router.post("/intentos/:id/finalizar", finalizarIntento);
router.get("/intentos", listarIntentosUsuario);
router.get("/intentos/:id/pdf", descargarPDFResultado);

export default router;
