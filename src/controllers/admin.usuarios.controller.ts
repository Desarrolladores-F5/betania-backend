// src/controllers/usuario.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { Usuario } from "../models/usuario.model";
import { Rol } from "../models/rol.model";

// GET /api/usuarios
export async function listUsuarios(_req: Request, res: Response) {
  const usuarios = await Usuario.findAll({
    attributes: [
      "id",
      "rut",
      "telefono",
      "nombres",
      "apellido_paterno",
      "apellido_materno",
      "email",
      "fecha_nacimiento",
      "rol_id",
      "activo",
      "created_at",
    ],
    include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
    order: [["id", "ASC"]],
  });
  return res.json({ ok: true, data: usuarios });
}

// GET /api/usuarios/:id
export async function getUsuario(req: Request, res: Response) {
  const id = Number(req.params.id);
  const u = await Usuario.findByPk(id, {
    attributes: [
      "id",
      "rut",
      "telefono",
      "nombres",
      "apellido_paterno",
      "apellido_materno",
      "email",
      "fecha_nacimiento",
      "rol_id",
      "activo",
      "created_at",
    ],
    include: [{ model: Rol, as: "rol", attributes: ["id", "nombre"] }],
  });
  if (!u) return res.status(404).json({ error: "Usuario no encontrado" });
  return res.json({ ok: true, data: u });
}

// POST /api/usuarios
export async function createUsuario(req: Request, res: Response) {
  try {
    const {
      rut,
      telefono,
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento, // 'YYYY-MM-DD' (opcional)
      email,
      password,
      rol_id,
      activo,
    } = req.body as {
      rut: string;
      telefono?: string | null;
      nombres: string;
      apellido_paterno?: string | null;
      apellido_materno?: string | null;
      fecha_nacimiento?: string | null; // DATEONLY
      email: string;
      password: string;
      rol_id: number;
      activo?: boolean;
    };

    // Validaciones mínimas
    if (!rut || !nombres || !email || !password || !rol_id) {
      return res.status(400).json({
        error:
          "Campos obligatorios: rut, nombres, email, password, rol_id (teléfono, apellidos y fecha_nacimiento son opcionales).",
      });
    }

    // Unicidad
    const existEmail = await Usuario.findOne({ where: { email } });
    if (existEmail) return res.status(409).json({ error: "Email ya existe" });

    const existRut = await Usuario.findOne({ where: { rut } });
    if (existRut) return res.status(409).json({ error: "RUT ya existe" });

    const password_hash = await bcrypt.hash(password, 10);

    const nuevo = await Usuario.create({
      rut,
      telefono: telefono ?? null,
      nombres,
      apellido_paterno: apellido_paterno ?? null,
      apellido_materno: apellido_materno ?? null,
      fecha_nacimiento: fecha_nacimiento ?? null,
      email,
      password_hash,
      rol_id,
      activo: activo ?? true,
    });

    return res.status(201).json({
      ok: true,
      data: {
        id: nuevo.id,
        rut: nuevo.rut,
        telefono: nuevo.telefono,
        nombres: nuevo.nombres,
        apellido_paterno: nuevo.apellido_paterno,
        apellido_materno: nuevo.apellido_materno,
        fecha_nacimiento: nuevo.fecha_nacimiento,
        email: nuevo.email,
        rol_id: nuevo.rol_id,
        activo: nuevo.activo,
        created_at: nuevo.created_at,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
}

// PUT /api/usuarios/:id
export async function updateUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const {
      rut,
      telefono,
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento, // 'YYYY-MM-DD'
      email,
      password,
      rol_id,
      activo,
    } = req.body as {
      rut?: string;
      telefono?: string | null;
      nombres?: string;
      apellido_paterno?: string | null;
      apellido_materno?: string | null;
      fecha_nacimiento?: string | null;
      email?: string;
      password?: string;
      rol_id?: number;
      activo?: boolean;
    };

    const u = await Usuario.findByPk(id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });

    // Cambios con validación de unicidad
    if (email && email !== u.email) {
      const exist = await Usuario.findOne({ where: { email, id: { [Op.ne]: id } } });
      if (exist) return res.status(409).json({ error: "Email ya existe" });
      u.email = email;
    }

    if (rut && rut !== u.rut) {
      const existR = await Usuario.findOne({ where: { rut, id: { [Op.ne]: id } } });
      if (existR) return res.status(409).json({ error: "RUT ya existe" });
      u.rut = rut;
    }

    if (typeof telefono !== "undefined") u.telefono = telefono; // puede ser null o string
    if (typeof nombres === "string") u.nombres = nombres;
    if (typeof apellido_paterno !== "undefined") u.apellido_paterno = apellido_paterno;
    if (typeof apellido_materno !== "undefined") u.apellido_materno = apellido_materno;
    if (typeof fecha_nacimiento !== "undefined") u.fecha_nacimiento = fecha_nacimiento;
    if (typeof rol_id === "number") u.rol_id = rol_id;
    if (typeof activo === "boolean") u.activo = activo;

    if (password) {
      u.password_hash = await bcrypt.hash(password, 10);
    }

    await u.save();

    return res.json({
      ok: true,
      data: {
        id: u.id,
        rut: u.rut,
        telefono: u.telefono,
        nombres: u.nombres,
        apellido_paterno: u.apellido_paterno,
        apellido_materno: u.apellido_materno,
        fecha_nacimiento: u.fecha_nacimiento,
        email: u.email,
        rol_id: u.rol_id,
        activo: u.activo,
        created_at: u.created_at,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

// DELETE /api/usuarios/:id  (borrado lógico)
export async function deleteUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const u = await Usuario.findByPk(id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });
    u.activo = false;
    await u.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
}
