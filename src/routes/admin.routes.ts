import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/ping", requireAuth, requireAdmin, async (_req, res) => {
  return res.json({ ok: true, area: "admin", ts: new Date().toISOString() });
});

export default router;
