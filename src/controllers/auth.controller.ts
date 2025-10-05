import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

// Extender tipo Usuario para incluir la relación Rol
type UsuarioConRol = Usuario & {
  rol?: {
    id: number;
    nombre: string;
  };
};

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Buscar usuario activo e incluir su rol
    const user = (await Usuario.findOne({
      where: { email, activo: true },
      include: [{ model: Rol, as: "rol" }],
    })) as UsuarioConRol;

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // === Normalizar rol ===
    const rolNormalizado = user.rol?.nombre === "usuario" ? "user" : "admin";

    // === Generar JWT ===
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: rolNormalizado },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // === Guardar token en cookie segura ===
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,       // true si usas HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    // === Devolver usuario al frontend (sin password) ===
    const userData = {
      id: user.id,
      email: user.email,
      nombres: user.nombres,
      rol: rolNormalizado,
    };

    return res.json({ user: userData });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno en login" });
  }
}
