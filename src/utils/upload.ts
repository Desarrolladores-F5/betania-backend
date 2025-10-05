// src/utils/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

/* ==========================================================================
   Constantes y utilidades
   ========================================================================== */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_PDF_SIZE_BYTES   = 25 * 1024 * 1024; // 25MB

const ROOT = process.cwd();
const UPLOADS_DIR = path.join(ROOT, "uploads");
const IMAGES_DIR  = path.join(UPLOADS_DIR, "images");
const PDFS_DIR    = path.join(UPLOADS_DIR, "pdfs");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Garantiza las carpetas en el arranque del proceso
[UPLOADS_DIR, IMAGES_DIR, PDFS_DIR].forEach(ensureDir);

/** Sanea y compone un nombre de archivo único y legible */
function makeFilename(original: string, fallback: string) {
  const ext = (path.extname(original) || "").toLowerCase();
  const base = path
    .basename(original || fallback, ext)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 64);

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${base || fallback}-${unique}${ext}`;
}

/** Construye URL absoluta pública a partir de un subpath (e.g. /uploads/...) */
export function publicUrl(req: Request, subpath: string) {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host  = req.get("host");
  return `${proto}://${host}${subpath}`;
}

/* ==========================================================================
   Filtros de tipo de archivo (seguridad)
   ========================================================================== */
function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
  if (!ok) return cb(new Error("Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)."));
  cb(null, true);
}

function pdfFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ok = file.mimetype === "application/pdf";
  if (!ok) return cb(new Error("Solo se permiten archivos PDF."));
  cb(null, true);
}

/* ==========================================================================
   Storages (diskStorage) por tipo
   ========================================================================== */
const imagesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(IMAGES_DIR);
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, makeFilename(file.originalname, "imagen"));
  },
});

const pdfsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(PDFS_DIR);
    cb(null, PDFS_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, makeFilename(file.originalname, "documento"));
  },
});

/* ==========================================================================
   Multer uploaders exportados
   ========================================================================== */
export const uploadImage = multer({
  storage: imagesStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

export const uploadPdf = multer({
  storage: pdfsStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: MAX_PDF_SIZE_BYTES },
});
