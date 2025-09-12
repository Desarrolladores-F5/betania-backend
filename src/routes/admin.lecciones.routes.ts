import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { crearLeccion, actualizarLeccion, eliminarLeccion } from "../controllers/leccion.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", crearLeccion);
router.put("/:id", actualizarLeccion);
router.delete("/:id", eliminarLeccion);

export default router;
