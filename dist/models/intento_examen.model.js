"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentoExamen = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const examen_model_1 = require("./examen.model");
const usuario_model_1 = require("./usuario.model");
class IntentoExamen extends sequelize_1.Model {
}
exports.IntentoExamen = IntentoExamen;
IntentoExamen.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    examen_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    usuario_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: false },
    puntaje_total: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
    aprobado: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: true },
    duracion_seg: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    fecha_inicio: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    fecha_fin: { type: sequelize_1.DataTypes.DATE, allowNull: true }
}, { sequelize: database_1.default, tableName: "intentos_examen", timestamps: false });
// Asociaciones (para incluir en reportes)
examen_model_1.Examen.hasMany(IntentoExamen, { foreignKey: "examen_id", as: "intentos", onDelete: "CASCADE" });
IntentoExamen.belongsTo(examen_model_1.Examen, { foreignKey: "examen_id", as: "examen" });
usuario_model_1.Usuario.hasMany(IntentoExamen, { foreignKey: "usuario_id", as: "intentos", onDelete: "CASCADE" });
IntentoExamen.belongsTo(usuario_model_1.Usuario, { foreignKey: "usuario_id", as: "usuario" });
