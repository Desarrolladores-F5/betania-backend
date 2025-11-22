import { Router } from "express";
import { login, me, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/login", login);       // login con cookie
router.get("/me", requireAuth, me); // validar sesión desde cookie
router.post("/logout", logout);     // limpiar cookie y cerrar sesión

export default router;
