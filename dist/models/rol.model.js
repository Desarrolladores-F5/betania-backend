"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rol = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Rol extends sequelize_1.Model {
}
exports.Rol = Rol;
Rol.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: true }
}, { sequelize: database_1.default, tableName: "roles" });
