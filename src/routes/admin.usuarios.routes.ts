// src/routes/usuarios.routes.ts
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../controllers/admin.usuarios.controller"; 

const router = Router();

// Todas las rutas protegidas para admin
router.use(requireAuth, requireAdmin);

router.get("/", listUsuarios);
router.get("/:id", getUsuario);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;
