"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsuarios = listUsuarios;
exports.getUsuario = getUsuario;
exports.createUsuario = createUsuario;
exports.updateUsuario = updateUsuario;
exports.deleteUsuario = deleteUsuario;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const usuario_model_1 = require("../models/usuario.model");
const rol_model_1 = require("../models/rol.model");
// GET /api/usuarios
async function listUsuarios(_req, res) {
    const usuarios = await usuario_model_1.Usuario.findAll({
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
        include: [{ model: rol_model_1.Rol, as: "rol", attributes: ["id", "nombre"] }],
        order: [["id", "ASC"]],
    });
    return res.json({ ok: true, data: usuarios });
}
// GET /api/usuarios/:id
async function getUsuario(req, res) {
    const id = Number(req.params.id);
    const u = await usuario_model_1.Usuario.findByPk(id, {
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
        include: [{ model: rol_model_1.Rol, as: "rol", attributes: ["id", "nombre"] }],
    });
    if (!u)
        return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ ok: true, data: u });
}
// POST /api/usuarios
async function createUsuario(req, res) {
    try {
        const { rut, telefono, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, // 'YYYY-MM-DD' (opcional)
        email, password, rol_id, activo, } = req.body;
        // Validaciones mínimas
        if (!rut || !nombres || !email || !password || !rol_id) {
            return res.status(400).json({
                error: "Campos obligatorios: rut, nombres, email, password, rol_id (teléfono, apellidos y fecha_nacimiento son opcionales).",
            });
        }
        // Unicidad
        const existEmail = await usuario_model_1.Usuario.findOne({ where: { email } });
        if (existEmail)
            return res.status(409).json({ error: "Email ya existe" });
        const existRut = await usuario_model_1.Usuario.findOne({ where: { rut } });
        if (existRut)
            return res.status(409).json({ error: "RUT ya existe" });
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        const nuevo = await usuario_model_1.Usuario.create({
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al crear usuario" });
    }
}
// PUT /api/usuarios/:id
async function updateUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const { rut, telefono, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, // 'YYYY-MM-DD'
        email, password, rol_id, activo, } = req.body;
        const u = await usuario_model_1.Usuario.findByPk(id);
        if (!u)
            return res.status(404).json({ error: "Usuario no encontrado" });
        // Cambios con validación de unicidad
        if (email && email !== u.email) {
            const exist = await usuario_model_1.Usuario.findOne({ where: { email, id: { [sequelize_1.Op.ne]: id } } });
            if (exist)
                return res.status(409).json({ error: "Email ya existe" });
            u.email = email;
        }
        if (rut && rut !== u.rut) {
            const existR = await usuario_model_1.Usuario.findOne({ where: { rut, id: { [sequelize_1.Op.ne]: id } } });
            if (existR)
                return res.status(409).json({ error: "RUT ya existe" });
            u.rut = rut;
        }
        if (typeof telefono !== "undefined")
            u.telefono = telefono; // puede ser null o string
        if (typeof nombres === "string")
            u.nombres = nombres;
        if (typeof apellido_paterno !== "undefined")
            u.apellido_paterno = apellido_paterno;
        if (typeof apellido_materno !== "undefined")
            u.apellido_materno = apellido_materno;
        if (typeof fecha_nacimiento !== "undefined")
            u.fecha_nacimiento = fecha_nacimiento;
        if (typeof rol_id === "number")
            u.rol_id = rol_id;
        if (typeof activo === "boolean")
            u.activo = activo;
        if (password) {
            u.password_hash = await bcryptjs_1.default.hash(password, 10);
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
}
// DELETE /api/usuarios/:id  (borrado lógico)
async function deleteUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const u = await usuario_model_1.Usuario.findByPk(id);
        if (!u)
            return res.status(404).json({ error: "Usuario no encontrado" });
        u.activo = false;
        await u.save();
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al eliminar usuario" });
    }
}
