// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

// Tipo extendido con relación al rol (para el resultado de Sequelize)
type UsuarioConRol = Usuario & {
  rol?: { id: number; nombre: string };
};

function normalizarRol(nombre?: string | null): "admin" | "supervisor" | "user" {
  const r = String(nombre ?? "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "supervisor") return "supervisor";
  return "user"; // "usuario", "user" u otros => "user"
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Ignora el defaultScope y TRAE explícitamente password_hash para poder comparar
    const user = (await Usuario.unscoped().findOne({
      where: { email, activo: true },
      attributes: ["id", "email", "nombres", "password_hash", "rol_id"],
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
    })) as UsuarioConRol | null;

    if (!user || !user.password_hash) {
      console.error("Login: usuario inexistente o password_hash ausente:", email);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparación segura
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const rolNormalizado = normalizarRol(user.rol?.nombre);

    // ============================
    //   Firma de JWT (forzando any)
    // ============================
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET no está definido en variables de entorno");
      return res.status(500).json({ error: "Configuración del servidor no válida" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      rol: rolNormalizado,
    };

    const options = {
      expiresIn: process.env.JWT_EXPIRES ?? "1d",
      algorithm: "HS256",
    };

    // 👉 Cast a any para saltar el problema de sobrecargas de tipos en Railway
    const signJwt = (jwt.sign as any);
    const token: string = signJwt(payload, secret, options);

    const isProd = process.env.NODE_ENV === "production";

    // Cookie JWT (HttpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,                    // HTTPS en prod
      sameSite: isProd ? "none" : "lax", // cross-site en prod
      maxAge: 24 * 60 * 60 * 1000,       // 1 día
      path: "/",
    });

    console.log(`LOGIN OK: userId=${user.id} rol=${rolNormalizado} secure=${isProd}`);

    // Respuesta pública mínima
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        nombres: user.nombres || "",
        rol: rolNormalizado,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno en login" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    // req.user viene desde requireAuth (contiene al menos { id, rol })
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Enriquecer con datos actuales desde BD
    const user = await Usuario.findByPk(req.user.id, {
      attributes: ["id", "email", "nombres", "rol_id", "activo"],
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
    });

    if (!user || user.activo !== true) {
      return res.status(404).json({ error: "Usuario no encontrado o inactivo" });
    }

    const rol = normalizarRol(user.rol?.nombre);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email ?? "",
        nombres: user.nombres ?? "",
        rol,
        rol_id: user.rol_id ?? null,
      },
    });
  } catch (err) {
    console.error("Error en /api/auth/me:", err);
    return res.status(500).json({ error: "Error interno en /me" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0), // expira inmediatamente
      path: "/",
    });
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (err) {
    console.error("Error en logout:", err);
    return res.status(500).json({ error: "Error interno en logout" });
  }
}
