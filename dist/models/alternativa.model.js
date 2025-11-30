"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alternativa = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const pregunta_model_1 = require("./pregunta.model");
class Alternativa extends sequelize_1.Model {
}
exports.Alternativa = Alternativa;
Alternativa.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    pregunta_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    texto: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    es_correcta: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize: database_1.default, tableName: "alternativas", timestamps: false });
pregunta_model_1.Pregunta.hasMany(Alternativa, { foreignKey: "pregunta_id", as: "alternativas", onDelete: "CASCADE" });
Alternativa.belongsTo(pregunta_model_1.Pregunta, { foreignKey: "pregunta_id", as: "pregunta" });
