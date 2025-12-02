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

// ⬅️ Usaremos el modelo Leccion en los GET de lectura
import { Leccion } from "./models/leccion.model";

import { initData } from "./utils/initData";
import { requireAuth, requireAdmin } from "./middlewares/auth";

// Rutas existentes
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

dotenv.config();

const app = express();

// ==================================================
// 🛡️ Seguridad global y middlewares base
// ==================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// --------------------------------------------------
// ⚙️ CORS: local + producción en Railway
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-betania-production.up.railway.app",
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Permitir también llamadas sin origin (Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("Origen no permitido por CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Soporte para preflight OPTIONS en todas las rutas
app.options("*", cors(corsOptions));

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
// 🔐 Rutas protegidas (Admin base + subrutas existentes)
// ==================================================
app.use("/api/admin", requireAuth, requireAdmin);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/usuarios", adminUsuariosRoutes);
app.use("/api/admin/cursos", adminCursosRoutes);
app.use("/api/admin/modulos", adminModulosRoutes);
app.use("/api/admin/lecciones", adminLeccionesRoutes);
app.use("/api/admin/uploads", adminUploadsRoutes);
app.use("/api/admin/examenes", adminExamenesRoutes);
app.use("/api/admin", adminReportesRoutes);

/* ==================================================
   ✅ ENDPOINTS DE LECTURA PARA LECCIONES
   (compatibles con tu frontend actual)
   ================================================== */

// GET /api/admin/lecciones?modulo_id=4
app.get(
  "/api/admin/lecciones",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { modulo_id } = req.query as { modulo_id?: string };
      const where = modulo_id ? { modulo_id: Number(modulo_id) } : undefined;
      const filas = await Leccion.findAll({ where });
      return res.json(filas);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ error: "No fue posible listar las lecciones" });
    }
  }
);

// GET /api/admin/lecciones/:id
app.get(
  "/api/admin/lecciones/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Leccion.findByPk(id);
      if (!item)
        return res.status(404).json({ error: "Lección no encontrada" });
      return res.json(item);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ error: "No fue posible obtener la lección" });
    }
  }
);

// GET /api/admin/modulos/:moduloId/lecciones
app.get(
  "/api/admin/modulos/:moduloId/lecciones",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { moduloId } = req.params;
      const lecciones = await Leccion.findAll({
        where: { modulo_id: Number(moduloId) },
        order: [
          ["orden", "ASC"],
          ["id", "ASC"],
        ],
      });

      return res.json({ moduloId: Number(moduloId), lecciones });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: "No fue posible obtener las lecciones del módulo",
      });
    }
  }
);

// ==================================================
// 🎓 Rutas públicas de usuario final
// ==================================================
app.use("/api/cursos", cursosRoutes);
app.use("/api/user/cursos", cursosRoutes);
app.use("/api/examenes", examenesRoutes);

// ==================================================
// 🚫 404 genérico
// ==================================================
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ==================================================
// 🚀 Inicialización del servidor
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
