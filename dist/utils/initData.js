"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initData = initData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const rol_model_1 = require("../models/rol.model");
const usuario_model_1 = require("../models/usuario.model");
async function initData() {
    // Roles por defecto
    const [adminRol] = await rol_model_1.Rol.findOrCreate({
        where: { nombre: "admin" },
        defaults: { nombre: "admin" }
    });
    await rol_model_1.Rol.findOrCreate({
        where: { nombre: "usuario" },
        defaults: { nombre: "usuario" }
    });
    // Admin por .env
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.warn("ADMIN_EMAIL/ADMIN_PASSWORD no configurados en .env — no se creará usuario admin por defecto");
        return;
    }
    const existe = await usuario_model_1.Usuario.findOne({ where: { email } });
    if (!existe) {
        const hash = await bcryptjs_1.default.hash(password, 10);
        await usuario_model_1.Usuario.create({
            nombres: "Admin",
            apellido_paterno: "Sistema",
            apellido_materno: "Interno",
            rut: "11.111.111-1", // Requerido por tu modelo (NOT NULL)
            telefono: null,
            fecha_nacimiento: null,
            email,
            password_hash: hash,
            rol_id: adminRol.id,
            activo: true
        });
        console.log(`✅ Usuario admin creado: ${email}`);
    }
    else {
        console.log(`ℹ️ Usuario admin ya existe: ${email}`);
    }
}
