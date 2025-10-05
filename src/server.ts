import express from "express";
import cors from "cors";
import helmet, { crossOriginResourcePolicy } from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import sequelize from "./config/database";

// ====== Modelos base ======
import "./models/rol.model";
import "./models/usuario.model";

// ====== Contenido ======
import "./models/curso.model";
import "./models/modulo.model";
import "./models/leccion.model";

// ====== Exámenes ======
import "./models/examen.model";
import "./models/pregunta.model";
import "./models/alternativa.model";
import "./models/intento_examen.model";
import "./models/respuesta_intento.model";
// IMPORTANTE: las asociaciones Intento⇄Examen/Usuario están dentro de intento_examen.model.ts

import { initData } from "./utils/initData";

// ====== Middlewares de auth (protección /api/admin) ======
import { requireAuth, requireAdmin } from "./middlewares/auth";

// ====== Rutas públicas / autenticación ======
import authRoutes from "./routes/auth.routes";

// ====== Rutas admin (todas quedarán bajo /api/admin, ya protegidas) ======
import adminRoutes from "./routes/admin.routes";
import adminUsuariosRoutes from "./routes/admin.usuarios.routes";
import adminCursosRoutes from "./routes/admin.cursos.routes";
import adminModulosRoutes from "./routes/admin.modulos.routes";
import adminLeccionesRoutes from "./routes/admin.lecciones.routes";
import adminUploadsRoutes from "./routes/admin.uploads.routes";
import adminExamenesRoutes from "./routes/admin.examenes.routes";
import adminReportesRoutes from "./routes/admin.reportes.routes";

// ====== Rutas para usuarios finales (no admin) ======
import cursosRoutes from "./routes/cursos.routes";
import examenesRoutes from "./routes/examenes.routes";

dotenv.config();

const app = express();

// -------- Middlewares globales --------
app.use(helmet());

// CORS para el frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// Archivos estáticos (subidas)
// Permite que otro origen (3000) use /uploads (evita CORP=same-origin de helmet)
app.use("/uploads", crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Healthcheck
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// -------- Rutas públicas --------
app.use("/api/auth", authRoutes);

// -------- Protección del namespace /api/admin --------
app.use("/api/admin", requireAuth, requireAdmin);

// -------- Rutas administrativas (heredan la protección anterior) --------
app.use("/api/admin", adminRoutes); // ej: /api/admin/ping
app.use("/api/admin/usuarios", adminUsuariosRoutes);
app.use("/api/admin/cursos", adminCursosRoutes);
app.use("/api/admin/modulos", adminModulosRoutes);
app.use("/api/admin/lecciones", adminLeccionesRoutes);
app.use("/api/admin/uploads", adminUploadsRoutes);
app.use("/api/admin/examenes", adminExamenesRoutes);
app.use("/api/admin", adminReportesRoutes);

// -------- Rutas de área de alumnos/usuarios (contenido/exámenes) --------
app.use("/api/cursos", cursosRoutes);
app.use("/api/examenes", examenesRoutes);

// 404 genérico
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

const PORT = Number(process.env.PORT || 3001);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await initData();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Error al iniciar servidor:", e);
    process.exit(1);
  }
}

start();
