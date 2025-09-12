import multer from "multer";
import path from "path";

const imagesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads/images")),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});

const pdfsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads/pdfs")),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});

export const uploadImage = multer({ storage: imagesStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
export const uploadPdf = multer({ storage: pdfsStorage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB
