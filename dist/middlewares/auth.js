"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: "No autorizado" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: "JWT_SECRET no configurado" });
        }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (!payload?.id || !payload?.rol) {
            return res.status(401).json({ error: "Token inválido" });
        }
        req.user = { id: payload.id, rol: payload.rol };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
    }
    if (req.user.rol !== "admin") {
        return res.status(403).json({ error: "Requiere rol admin" });
    }
    next();
}
