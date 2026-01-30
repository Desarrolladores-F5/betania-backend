// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

// ===============================
// Tipos auxiliares
// ===============================
type UsuarioConRol = Usuario & {
  rol?: { id: number; nombre: string };
};

function normalizarRol(
  nombre?: string | null
): "admin" | "supervisor" | "user" {
  const r = String(nombre ?? "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "supervisor") return "supervisor";
  return "user";
}

// ===============================
// LOGIN (Bearer token)
// ===============================
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Buscar usuario (trayendo password_hash explícitamente)
    const user = (await Usuario.unscoped().findOne({
      where: { email, activo: true },
      attributes: ["id", "email", "nombres", "password_hash", "rol_id"],
      include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
    })) as UsuarioConRol | null;

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Validar password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const rolNormalizado = normalizarRol(user.rol?.nombre);

    // ===============================
    // JWT
    // ===============================
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET no definido");
      return res
        .status(500)
        .json({ error: "Configuración del servidor inválida" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      rol: rolNormalizado,
    };

    // FIX TS2322 (jsonwebtoken)
    const expiresEnv = process.env.JWT_EXPIRES;

    const expiresIn: SignOptions["expiresIn"] =
      typeof expiresEnv === "string" && expiresEnv.trim() !== ""
        ? (expiresEnv as SignOptions["expiresIn"])
        : "1d";

    const options: SignOptions = {
      expiresIn,
      algorithm: "HS256",
    };

    const token = jwt.sign(payload, secret as Secret, options);

    console.log(`LOGIN OK: userId=${user.id} rol=${rolNormalizado}`);

    // ✅ IMPORTANTE: devolver token para Authorization: Bearer
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombres: user.nombres ?? "",
        rol: rolNormalizado,
        rol_id: user.rol_id ?? null,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno en login" });
  }
}

// ===============================
// ME (protegido con requireAuth Bearer)
// ===============================
export async function me(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

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
  } catch (error) {
    console.error("Error en /me:", error);
    return res.status(500).json({ error: "Error interno en /me" });
  }
}

// ===============================
// LOGOUT (Bearer token)
// ===============================
// En Bearer token, el “logout” real se hace en el frontend borrando el token.
// Este endpoint solo responde OK para mantener la interfaz.
export async function logout(req: Request, res: Response) {
  try {
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ error: "Error interno en logout" });
  }
}
