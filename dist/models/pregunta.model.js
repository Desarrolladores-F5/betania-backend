"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pregunta = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const examen_model_1 = require("./examen.model");
class Pregunta extends sequelize_1.Model {
}
exports.Pregunta = Pregunta;
Pregunta.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    examen_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    enunciado: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    puntaje: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
    orden: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
}, { sequelize: database_1.default, tableName: "preguntas", timestamps: false });
examen_model_1.Examen.hasMany(Pregunta, { foreignKey: "examen_id", as: "preguntas", onDelete: "CASCADE" });
Pregunta.belongsTo(examen_model_1.Examen, { foreignKey: "examen_id", as: "examen" });
