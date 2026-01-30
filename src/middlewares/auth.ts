import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
  id: number;
  rol: string;
  email?: string;
}

function extraerTokenBearer(req: Request): string | null {
  const auth = req.headers.authorization;

  if (!auth || typeof auth !== "string") return null;

  // Formato esperado: "Bearer <token>"
  const [scheme, token] = auth.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer") return null;
  if (!token || token.trim() === "") return null;

  return token.trim();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extraerTokenBearer(req);

    if (!token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT_SECRET no configurado" });
    }

    const payload = jwt.verify(token, secret) as UserPayload;

    if (!payload?.id || !payload?.rol) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Adjuntamos datos mínimos al request
    req.user = { id: payload.id, rol: payload.rol };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Requiere rol admin" });
  }

  return next();
}
