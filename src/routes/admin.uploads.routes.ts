import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { uploadImage, uploadPdf } from "../utils/upload";

const router = Router();

router.post("/imagen", requireAuth, requireAdmin, uploadImage.single("file"), (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "Archivo requerido" });
  const url = `/uploads/images/${file.filename}`;
  return res.status(201).json({ url });
});

router.post("/pdf", requireAuth, requireAdmin, uploadPdf.single("file"), (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "Archivo requerido" });
  const url = `/uploads/pdfs/${file.filename}`;
  return res.status(201).json({ url });
});

export default router;
