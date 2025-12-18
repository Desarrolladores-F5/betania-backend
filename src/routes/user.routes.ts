// src/routes/user.routes.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { obtenerEstadisticasUsuario } from "../controllers/user.estadisticas.controller";

const router = Router();

// Todas las rutas de /user requieren autenticación
router.use(requireAuth);

// GET /api/user/estadisticas
router.get("/estadisticas", obtenerEstadisticasUsuario);

export default router;
