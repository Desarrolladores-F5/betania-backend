import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { listarIntentosAdmin, agregadosExamen } from "../controllers/admin.reportes.controller";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/intentos", listarIntentosAdmin);
router.get("/reportes/examenes", agregadosExamen);

export default router;
