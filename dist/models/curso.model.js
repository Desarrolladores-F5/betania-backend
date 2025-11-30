"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curso = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Curso extends sequelize_1.Model {
}
exports.Curso = Curso;
Curso.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    titulo: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    descripcion: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    portada_url: { type: sequelize_1.DataTypes.STRING(1024), allowNull: true },
    publicado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    activo: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: true }
}, { sequelize: database_1.default, tableName: "cursos" });
