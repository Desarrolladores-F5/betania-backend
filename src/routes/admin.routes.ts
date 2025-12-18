//src/routes/admin.routes.ts
import { Router, Request, Response } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import adminUsuariosRouter from "./admin.usuarios.routes";
import adminReportesRouter from "./admin.reportes.routes";

const router = Router();

// Aplica autenticación y autorización a TODO lo que cuelga de /api/admin/*
router.use(requireAuth, requireAdmin);

// Healthcheck / ping
router.get("/ping", (_req, res) => {
  res.json({ ok: true, area: "admin", ts: new Date().toISOString() });
});

// Dashboard de admin
router.get("/dashboard", (req: Request, res: Response) => {
  res.json({
    message: "Dashboard admin accesible",
    user: req.user,
    ts: new Date().toISOString(),
  });
});

// -----------------------------
// Rutas admin
// -----------------------------
router.use("/usuarios", adminUsuariosRouter);

// ✅ ESTA LÍNEA ES LA CLAVE
router.use("/reportes", adminReportesRouter);

export default router;
