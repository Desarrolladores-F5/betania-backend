"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Examen = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const curso_model_1 = require("./curso.model");
class Examen extends sequelize_1.Model {
}
exports.Examen = Examen;
Examen.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    curso_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    titulo: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    tiempo_limite_seg: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    intento_max: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    publicado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize: database_1.default, tableName: "examenes", timestamps: false });
// Relación con Curso
curso_model_1.Curso.hasOne(Examen, { foreignKey: "curso_id", as: "examen", onDelete: "CASCADE" });
Examen.belongsTo(curso_model_1.Curso, { foreignKey: "curso_id", as: "curso" });
