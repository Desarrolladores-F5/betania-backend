// src/routes/admin.reportes.routes.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  listarIntentosAdmin,
  agregadosExamen,
  resumenAprobacionesAdmin,
  aprobacionesAdmin,
} from "../controllers/admin.reportes.controller";

const router = Router();
router.use(requireAuth, requireAdmin);

// -------------------------------
// Reportería exámenes (existente)
// -------------------------------
router.get("/intentos", listarIntentosAdmin);

// ✅ Ruta correcta (recomendada)
router.get("/examenes/agregados", agregadosExamen);

// ⚠ Compatibilidad con tu ruta actual (evita romper frontend/back anterior)
router.get("/reportes/examenes", agregadosExamen);

// ---------------------------------------------
// ✅ NUEVO: Reportería de aprobaciones (MVP)
// ---------------------------------------------
router.get("/resumen", resumenAprobacionesAdmin);
router.get("/aprobaciones", aprobacionesAdmin);

export default router;
