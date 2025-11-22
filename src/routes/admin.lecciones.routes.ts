import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  listarLecciones,
  obtenerLeccionAdmin,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion,
  listarLeccionesPorModulo,
} from "../controllers/leccion.controller";

const router = Router();

// Todas requieren admin
router.use(requireAuth, requireAdmin);

// ---- Rutas planas ----
router.get("/", listarLecciones);        // GET /api/admin/lecciones?modulo_id=4
router.get("/:id", obtenerLeccionAdmin); // GET /api/admin/lecciones/:id
router.post("/", crearLeccion);
router.put("/:id", actualizarLeccion);
router.delete("/:id", eliminarLeccion);

export default router;

// ---- Ruta anidada bajo /api/admin/modulos/:moduloId/lecciones ----
// Para evitar otro archivo, exportamos también un subrouter.
export const adminLeccionesAnidadas = Router({ mergeParams: true });
adminLeccionesAnidadas.use(requireAuth, requireAdmin);
adminLeccionesAnidadas.get("/", listarLeccionesPorModulo);
