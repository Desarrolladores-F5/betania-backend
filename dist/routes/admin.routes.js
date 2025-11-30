"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const admin_usuarios_routes_1 = __importDefault(require("./admin.usuarios.routes"));
const router = (0, express_1.Router)();
// Aplica autenticación y autorización a TODO lo que cuelga de /api/admin/*
router.use(auth_1.requireAuth, auth_1.requireAdmin);
// Healthcheck / ping
router.get("/ping", (_req, res) => {
    res.json({ ok: true, area: "admin", ts: new Date().toISOString() });
});
// Dashboard de admin
router.get("/dashboard", (req, res) => {
    // Aquí puedes devolver datos que necesites en el dashboard
    res.json({
        message: "Dashboard admin accesible",
        user: req.user, // info del admin logueado
        ts: new Date().toISOString(),
    });
});
// CRUD de usuarios administrado
router.use("/usuarios", admin_usuarios_routes_1.default);
exports.default = router;
