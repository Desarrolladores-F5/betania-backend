// src/routes/admin.modulos.routes.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  crearModulo,
  actualizarModulo,
  eliminarModulo,
  listarModulos,
  obtenerModuloPorId,
} from "../controllers/modulo.controller";
import { uploadPdf } from "../utils/upload"; 

const router = Router();

// Todas las rutas de módulos requieren auth + rol admin
router.use(requireAuth, requireAdmin);

// Crear módulo (PDF opcional en el campo "pdf_intro")
router.post("/", uploadPdf.single("pdf_intro"), crearModulo);

// Listar todos los módulos
router.get("/", listarModulos);

// Obtener un módulo por ID
router.get("/:id", obtenerModuloPorId);

// Actualizar módulo (PDF opcional en el campo "pdf_intro")
router.put("/:id", uploadPdf.single("pdf_intro"), actualizarModulo);

// Eliminar módulo
router.delete("/:id", eliminarModulo);

export default router;
