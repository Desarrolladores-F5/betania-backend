import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { crearModulo, actualizarModulo, eliminarModulo } from "../controllers/modulo.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/", crearModulo);
router.put("/:id", actualizarModulo);
router.delete("/:id", eliminarModulo);

export default router;
