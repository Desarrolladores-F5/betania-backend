"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdf = exports.uploadImage = exports.MAX_PDF_SIZE_BYTES = exports.MAX_IMAGE_SIZE_BYTES = void 0;
exports.publicUrl = publicUrl;
// src/utils/upload.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* ==========================================================================
   Constantes y utilidades
   ========================================================================== */
exports.MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
exports.MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ROOT = process.cwd();
const UPLOADS_DIR = path_1.default.join(ROOT, "uploads");
const IMAGES_DIR = path_1.default.join(UPLOADS_DIR, "images");
const PDFS_DIR = path_1.default.join(UPLOADS_DIR, "pdfs");
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
// Garantiza las carpetas en el arranque del proceso
[UPLOADS_DIR, IMAGES_DIR, PDFS_DIR].forEach(ensureDir);
/** Sanea y compone un nombre de archivo único y legible */
function makeFilename(original, fallback) {
    const ext = (path_1.default.extname(original) || "").toLowerCase();
    const base = path_1.default
        .basename(original || fallback, ext)
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .slice(0, 64);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${base || fallback}-${unique}${ext}`;
}
/** Construye URL absoluta pública a partir de un subpath (e.g. /uploads/...) */
function publicUrl(req, subpath) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    return `${proto}://${host}${subpath}`;
}
/* ==========================================================================
   Filtros de tipo de archivo (seguridad)
   ========================================================================== */
function imageFilter(_req, file, cb) {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    if (!ok)
        return cb(new Error("Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)."));
    cb(null, true);
}
function pdfFilter(_req, file, cb) {
    const ok = file.mimetype === "application/pdf";
    if (!ok)
        return cb(new Error("Solo se permiten archivos PDF."));
    cb(null, true);
}
/* ==========================================================================
   Storages (diskStorage) por tipo
   ========================================================================== */
const imagesStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(IMAGES_DIR);
        cb(null, IMAGES_DIR);
    },
    filename: (_req, file, cb) => {
        cb(null, makeFilename(file.originalname, "imagen"));
    },
});
const pdfsStorage = multer_1.default.diskStorage({
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
exports.uploadImage = (0, multer_1.default)({
    storage: imagesStorage,
    fileFilter: imageFilter,
    limits: { fileSize: exports.MAX_IMAGE_SIZE_BYTES },
});
exports.uploadPdf = (0, multer_1.default)({
    storage: pdfsStorage,
    fileFilter: pdfFilter,
    limits: { fileSize: exports.MAX_PDF_SIZE_BYTES },
});
