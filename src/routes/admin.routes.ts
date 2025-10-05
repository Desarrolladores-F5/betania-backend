import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import adminUsuariosRouter from "./admin.usuarios.routes";

const router = Router();

// Protege TODO lo que cuelga de /api/admin/*
router.use(requireAuth, requireAdmin);

// Health/ping del área admin
router.get("/ping", (_req, res) => {
  res.json({ ok: true, area: "admin", ts: new Date().toISOString() });
});

// CRUD de usuarios administrado
router.use("/usuarios", adminUsuariosRouter);

export default router;
