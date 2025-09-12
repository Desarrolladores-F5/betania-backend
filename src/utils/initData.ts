import bcrypt from "bcryptjs";
import { Rol } from "../models/rol.model";
import { Usuario } from "../models/usuario.model";

export async function initData() {
  // Roles por defecto
  const [adminRol] = await Rol.findOrCreate({ where: { nombre: "admin" }, defaults: { nombre: "admin" } });
  await Rol.findOrCreate({ where: { nombre: "usuario" }, defaults: { nombre: "usuario" } });

  // Admin por .env
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD no configurados en .env — no se creará usuario admin por defecto");
    return;
  }

  const existe = await Usuario.findOne({ where: { email } });
  if (!existe) {
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({
      nombre: "Admin",
      apellido: "Sistema",
      email,
      password_hash: hash,
      rol_id: adminRol.id,
      activo: true
    });
    console.log(`✅ Usuario admin creado: ${email}`);
  } else {
    console.log(`ℹ️ Usuario admin ya existe: ${email}`);
  }
}
