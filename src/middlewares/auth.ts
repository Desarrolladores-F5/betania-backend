import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Si en tu sistema el rol admin es ID=1, declara una constante:
const ADMIN_ROLE_ID = 1;

interface UserTokenPayload extends JwtPayload {
  id: number;
  rol_id: number;
}

/**
 * Autenticación por JWT en Authorization: Bearer <token>
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header("authorization") || req.header("Authorization") || "";
    // Permite espacios extra, mayúsculas/minúsculas en "Bearer"
    const parts = auth.trim().split(/\s+/);
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const token = parts[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT_SECRET no configurado" });
    }

    // Restringe algoritmo por seguridad
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as UserTokenPayload;

    if (!payload?.id || typeof payload.rol_id !== "number") {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = { id: payload.id, rol_id: payload.rol_id };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Autorización: solo administradores.
 * Más eficiente: evita consultar DB en cada request (usa rol_id).
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autorizado" });
    if (req.user.rol_id !== ADMIN_ROLE_ID) {
      return res.status(403).json({ error: "Requiere rol admin" });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ error: "Error de autorización" });
  }
}
