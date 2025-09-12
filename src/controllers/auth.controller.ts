import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

    const user = await Usuario.findOne({ where: { email, activo: true }, include: [{ model: Rol, as: "rol" }] });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const secret = process.env.JWT_SECRET;
    const expires = process.env.JWT_EXPIRES || "30m";
    if (!secret) return res.status(500).json({ error: "JWT_SECRET no configurado" });

    const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, secret, { algorithm: "HS256", expiresIn: expires });

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol_id: user.rol_id
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en login" });
  }
}
