"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = __importDefault(require("./config/database"));
// ⚠️ Importar modelos ANTES de sync
require("./models/rol.model");
require("./models/usuario.model");
require("./models/curso.model");
require("./models/modulo.model");
require("./models/leccion.model");
require("./models/examen.model");
require("./models/pregunta.model");
require("./models/alternativa.model");
require("./models/intento_examen.model");
require("./models/respuesta_intento.model");
require("./models/progreso_modulo.model");
require("./models/progreso_leccion.model");
// ⬅️ Usaremos el modelo Leccion en los GET de lectura
const leccion_model_1 = require("./models/leccion.model");
const initData_1 = require("./utils/initData");
const auth_1 = require("./middlewares/auth");
// Rutas existentes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const admin_usuarios_routes_1 = __importDefault(require("./routes/admin.usuarios.routes"));
const admin_cursos_routes_1 = __importDefault(require("./routes/admin.cursos.routes"));
const admin_modulos_routes_1 = __importDefault(require("./routes/admin.modulos.routes"));
const admin_lecciones_routes_1 = __importDefault(require("./routes/admin.lecciones.routes"));
const admin_uploads_routes_1 = __importDefault(require("./routes/admin.uploads.routes"));
const admin_examenes_routes_1 = __importDefault(require("./routes/admin.examenes.routes"));
const admin_reportes_routes_1 = __importDefault(require("./routes/admin.reportes.routes"));
const cursos_routes_1 = __importDefault(require("./routes/cursos.routes"));
const examenes_routes_1 = __importDefault(require("./routes/examenes.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ==================================================
// 🛡️ Seguridad global y middlewares base
// ==================================================
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Permite cookies entre dominios
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// ==================================================
// 📁 Archivos estáticos
// ==================================================
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// ==================================================
// ❤️ Healthcheck
// ==================================================
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
// ==================================================
// 🔓 Rutas públicas
// ==================================================
app.use("/api/auth", auth_routes_1.default);
// ==================================================
// 🔐 Rutas protegidas (Admin base + subrutas existentes)
// ==================================================
app.use("/api/admin", auth_1.requireAuth, auth_1.requireAdmin);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/admin/usuarios", admin_usuarios_routes_1.default);
app.use("/api/admin/cursos", admin_cursos_routes_1.default);
app.use("/api/admin/modulos", admin_modulos_routes_1.default);
app.use("/api/admin/lecciones", admin_lecciones_routes_1.default);
app.use("/api/admin/uploads", admin_uploads_routes_1.default);
app.use("/api/admin/examenes", admin_examenes_routes_1.default);
app.use("/api/admin", admin_reportes_routes_1.default);
/* ==================================================
   ✅ ENDPOINTS DE LECTURA PARA LECCIONES
   (compatibles con tu frontend actual)
   ================================================== */
// GET /api/admin/lecciones?modulo_id=4
app.get("/api/admin/lecciones", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { modulo_id } = req.query;
        const where = modulo_id ? { modulo_id: Number(modulo_id) } : undefined;
        const filas = await leccion_model_1.Leccion.findAll({ where });
        // Devolvemos arreglo plano para que tu normalizador lo acepte
        return res.json(filas);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No fue posible listar las lecciones" });
    }
});
// GET /api/admin/lecciones/:id
app.get("/api/admin/lecciones/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await leccion_model_1.Leccion.findByPk(id);
        if (!item)
            return res.status(404).json({ error: "Lección no encontrada" });
        return res.json(item);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No fue posible obtener la lección" });
    }
});
// GET /api/admin/modulos/:moduloId/lecciones  ← ruta anidada que usa tu UI
app.get("/api/admin/modulos/:moduloId/lecciones", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { moduloId } = req.params;
        const lecciones = await leccion_model_1.Leccion.findAll({
            where: { modulo_id: Number(moduloId) },
            order: [["orden", "ASC"], ["id", "ASC"]],
        });
        // Estructura amigable (tu frontend soporta { lecciones: [...] } y lista plana)
        return res.json({ moduloId: Number(moduloId), lecciones });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No fue posible obtener las lecciones del módulo" });
    }
});
// ==================================================
// 🎓 Rutas públicas de usuario final
// ==================================================
app.use("/api/cursos", cursos_routes_1.default);
app.use("/api/user/cursos", cursos_routes_1.default);
app.use("/api/examenes", examenes_routes_1.default);
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
        await database_1.default.authenticate();
        // Evita recrear índices/llaves (previene ER_TOO_MANY_KEYS)
        await database_1.default.sync();
        await (0, initData_1.initData)();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Error al iniciar servidor:", error);
        process.exit(1);
    }
}
start();
