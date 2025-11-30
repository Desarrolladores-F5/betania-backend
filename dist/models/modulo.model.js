"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modulo = void 0;
// src/models/modulo.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const curso_model_1 = require("./curso.model");
class Modulo extends sequelize_1.Model {
}
exports.Modulo = Modulo;
Modulo.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    curso_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    // 🔹 Agregados 🎯
    video_intro_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    pdf_intro_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    orden: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, { sequelize: database_1.default, tableName: "modulos", timestamps: false });
// Relaciones con Curso
curso_model_1.Curso.hasMany(Modulo, {
    foreignKey: "curso_id",
    as: "modulos",
    onDelete: "CASCADE",
});
Modulo.belongsTo(curso_model_1.Curso, { foreignKey: "curso_id", as: "curso" });
