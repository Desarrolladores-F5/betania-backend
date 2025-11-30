"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leccion = void 0;
// src/models/leccion.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const modulo_model_1 = require("./modulo.model");
const examen_model_1 = require("./examen.model"); // 👈 IMPORTANTE
/**
 * ==============================================================
 * Modelo: Leccion
 * ==============================================================
 * Representa una lección (video, PDF, etc.) dentro de un módulo.
 * Cada lección pertenece a un único módulo.
 * Opcionalmente puede estar vinculada a un examen (examen_id).
 * ==============================================================
 */
class Leccion extends sequelize_1.Model {
}
exports.Leccion = Leccion;
Leccion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    modulo_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    examen_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    // ============ PDF CONTENIDO PRINCIPAL (nuevo) ============
    contenido_pdf_url: {
        type: sequelize_1.DataTypes.STRING(1024),
        allowNull: true,
        comment: "PDF con el contenido principal de la clase",
    },
    contenido_pdf_titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: "Título visible del PDF de contenido principal",
    },
    // ================= VIDEO PRINCIPAL =================
    youtube_id: {
        type: sequelize_1.DataTypes.STRING(255), // URL o ID
        allowNull: true,
        comment: "URL o ID del video de YouTube asociado (si aplica)",
    },
    youtube_titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: "Título legible del video principal",
    },
    // ================= VIDEO ADICIONAL =================
    youtube_id_extra: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: "URL o ID de un segundo video de YouTube (opcional)",
    },
    youtube_titulo_extra: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: "Título legible del video adicional",
    },
    // ====================== PDF APOYO ========================
    pdf_url: {
        type: sequelize_1.DataTypes.STRING(1024),
        allowNull: true,
        comment: "Ruta o URL del material PDF de apoyo (si aplica)",
    },
    pdf_titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: "Título legible del PDF principal/de apoyo",
    },
    // ================= ORDEN / ESTADO ==================
    orden: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    publicado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.default,
    tableName: "lecciones",
    timestamps: false,
    underscored: true,
    modelName: "Leccion",
});
// ========================= RELACIONES =========================
modulo_model_1.Modulo.hasMany(Leccion, {
    foreignKey: "modulo_id",
    as: "lecciones",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
Leccion.belongsTo(modulo_model_1.Modulo, {
    foreignKey: "modulo_id",
    as: "modulo",
});
examen_model_1.Examen.hasMany(Leccion, {
    foreignKey: "examen_id",
    as: "lecciones",
});
Leccion.belongsTo(examen_model_1.Examen, {
    foreignKey: "examen_id",
    as: "examen",
});
