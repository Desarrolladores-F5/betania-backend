// src/routes/admin.mail.routes.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { verifyMailer } from "../utils/mailer";

const router = Router();

// Todo lo que cuelga de /api/admin/mail requiere admin
router.use(requireAuth, requireAdmin);

// GET /api/admin/mail/verify
router.get("/verify", async (_req, res) => {
  try {
    await verifyMailer();
    return res.json({ ok: true, message: "SMTP verificado correctamente" });
  } catch (err: any) {
    console.error("SMTP verify error:", err);
    return res.status(500).json({
      ok: false,
      error: "No se pudo verificar SMTP",
      detail: err?.message ?? String(err),
    });
  }
});

export default router;
