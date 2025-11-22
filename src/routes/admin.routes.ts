import { Router, Request, Response } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import adminUsuariosRouter from "./admin.usuarios.routes";

const router = Router();

// Aplica autenticación y autorización a TODO lo que cuelga de /api/admin/*
router.use(requireAuth, requireAdmin);

// Healthcheck / ping
router.get("/ping", (_req, res) => {
  res.json({ ok: true, area: "admin", ts: new Date().toISOString() });
});

// Dashboard de admin
router.get("/dashboard", (req: Request, res: Response) => {
  // Aquí puedes devolver datos que necesites en el dashboard
  res.json({
    message: "Dashboard admin accesible",
    user: req.user, // info del admin logueado
    ts: new Date().toISOString(),
  });
});

// CRUD de usuarios administrado
router.use("/usuarios", adminUsuariosRouter);

export default router;
