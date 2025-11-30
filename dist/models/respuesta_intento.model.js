"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespuestaIntento = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const intento_examen_model_1 = require("./intento_examen.model");
class RespuestaIntento extends sequelize_1.Model {
}
exports.RespuestaIntento = RespuestaIntento;
RespuestaIntento.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    intento_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pregunta_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    alternativa_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    correcta: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    puntaje_obtenido: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
}, { sequelize: database_1.default, tableName: "respuestas_intento", timestamps: false });
// Relaciones
intento_examen_model_1.IntentoExamen.hasMany(RespuestaIntento, { foreignKey: "intento_id", as: "respuestas", onDelete: "CASCADE" });
RespuestaIntento.belongsTo(intento_examen_model_1.IntentoExamen, { foreignKey: "intento_id", as: "intento" });
