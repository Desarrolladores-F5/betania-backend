// src/server.ts
import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import sequelize from "./config/database";

// ⚠️ Importar modelos ANTES de sync
import "./models/rol.model";
import "./models/usuario.model";
import "./models/curso.model";
import "./models/modulo.model";
import "./models/leccion.model";
import "./models/examen.model";
import "./models/pregunta.model";
import "./models/alternativa.model";
import "./models/intento_examen.model";
import "./models/respuesta_intento.model";
import "./models/progreso_modulo.model";
import "./models/progreso_leccion.model";

// Usaremos el modelo Leccion en algunos GET
import { Leccion } from "./models/leccion.model";

import { initData } from "./utils/initData";
import { requireAuth, requireAdmin } from "./middlewares/auth";

// Rutas
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import adminUsuariosRoutes from "./routes/admin.usuarios.routes";
import adminCursosRoutes from "./routes/admin.cursos.routes";
import adminModulosRoutes from "./routes/admin.modulos.routes";
import adminLeccionesRoutes from "./routes/admin.lecciones.routes";
import adminUploadsRoutes from "./routes/admin.uploads.routes";
import adminExamenesRoutes from "./routes/admin.examenes.routes";
import adminReportesRoutes from "./routes/admin.reportes.routes";
import cursosRoutes from "./routes/cursos.routes";
import examenesRoutes from "./routes/examenes.routes";
import userRoutes from "./routes/user.routes";
import adminMailRoutes from "./routes/admin.mail.routes";

dotenv.config();

const app = express();

// ==================================================
// 🛡️ Seguridad global
// ==================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==================================================
// ⚙️ CORS
// ==================================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-betania-production.up.railway.app",
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("Origen no permitido por CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==================================================
// 📁 Archivos estáticos
// ==================================================
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==================================================
// ❤️ Healthcheck
// ==================================================
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// ==================================================
// 🔓 Rutas públicas
// ==================================================
app.use("/api/auth", authRoutes);

// ==================================================
// 🔐 Rutas ADMIN (protección global)
// ==================================================
app.use("/api/admin", requireAuth, requireAdmin);

// Core admin
app.use("/api/admin", adminRoutes);

// Submódulos admin
app.use("/api/admin/usuarios", adminUsuariosRoutes);
app.use("/api/admin/cursos", adminCursosRoutes);
app.use("/api/admin/modulos", adminModulosRoutes);
app.use("/api/admin/lecciones", adminLeccionesRoutes);
app.use("/api/admin/uploads", adminUploadsRoutes);
app.use("/api/admin/examenes", adminExamenesRoutes);
app.use("/api/admin/reportes", adminReportesRoutes);
app.use("/api/admin/mail", adminMailRoutes);

// ==================================================
// 📘 Endpoints auxiliares de lectura (compatibilidad)
// ==================================================
app.get("/api/admin/lecciones", async (req, res) => {
  try {
    const { modulo_id } = req.query as { modulo_id?: string };
    const where = modulo_id ? { modulo_id: Number(modulo_id) } : undefined;
    const filas = await Leccion.findAll({ where });
    return res.json(filas);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No fue posible listar las lecciones" });
  }
});

app.get("/api/admin/lecciones/:id", async (req, res) => {
  try {
    const item = await Leccion.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }
    return res.json(item);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No fue posible obtener la lección" });
  }
});

app.get("/api/admin/modulos/:moduloId/lecciones", async (req, res) => {
  try {
    const lecciones = await Leccion.findAll({
      where: { modulo_id: Number(req.params.moduloId) },
      order: [
        ["orden", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json({
      moduloId: Number(req.params.moduloId),
      lecciones,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "No fue posible obtener las lecciones del módulo",
    });
  }
});

// ==================================================
// 🎓 Rutas USUARIO
// ==================================================
app.use("/api/user", userRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/user/cursos", cursosRoutes);
app.use("/api/examenes", examenesRoutes);

// ==================================================
// 🚫 404 genérico
// ==================================================
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ==================================================
// 🚀 Inicio servidor
// ==================================================
const PORT = Number(process.env.PORT || 3001);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await initData();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
}

start();
