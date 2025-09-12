import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

interface UserTokenPayload extends JwtPayload {
  id: number;
  rol_id: number;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");
    if (type !== "Bearer" || !token) return res.status(401).json({ error: "No autorizado" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "JWT_SECRET no configurado" });

    const payload = jwt.verify(token, secret) as UserTokenPayload;
    (req as any).user = { id: payload.id, rol_id: payload.rol_id };
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user as { id: number; rol_id: number } | undefined;
    if (!user) return res.status(401).json({ error: "No autorizado" });

    const rol = await Rol.findByPk(user.rol_id);
    if (!rol || rol.nombre !== "admin") return res.status(403).json({ error: "Requiere rol admin" });

    return next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error de autorización" });
  }
}
