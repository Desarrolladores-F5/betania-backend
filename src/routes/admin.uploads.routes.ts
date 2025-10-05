import { Router } from "express";
import path from "path";
import { uploadImage, uploadPdf } from "../utils/upload";

const router = Router();

router.post("/imagen", uploadImage.single("file"), (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "Archivo requerido" });

  const relative = `/uploads/images/${file.filename}`;
  const absolute = `${req.protocol}://${req.get("host")}${relative}`;
  return res.status(201).json({ url: absolute, filename: path.basename(file.filename), size: file.size, mimetype: file.mimetype });
});

router.post("/pdf", uploadPdf.single("file"), (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "Archivo requerido" });

  const relative = `/uploads/pdfs/${file.filename}`;
  const absolute = `${req.protocol}://${req.get("host")}${relative}`;
  return res.status(201).json({ url: absolute, filename: path.basename(file.filename), size: file.size, mimetype: file.mimetype });
});

export default router;
