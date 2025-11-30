"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoModulo = void 0;
// src/models/progreso_modulo.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const usuario_model_1 = require("./usuario.model");
const curso_model_1 = require("./curso.model");
const modulo_model_1 = require("./modulo.model");
class ProgresoModulo extends sequelize_1.Model {
}
exports.ProgresoModulo = ProgresoModulo;
ProgresoModulo.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    curso_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    modulo_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("bloqueado", "disponible", "completado"),
        allowNull: false,
        defaultValue: "bloqueado",
    },
    fecha_desbloqueo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fecha_completado: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: "progreso_modulo",
    modelName: "ProgresoModulo",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
});
// Asociaciones básicas
usuario_model_1.Usuario.hasMany(ProgresoModulo, {
    foreignKey: "usuario_id",
    as: "progresos_modulos",
});
ProgresoModulo.belongsTo(usuario_model_1.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
});
curso_model_1.Curso.hasMany(ProgresoModulo, {
    foreignKey: "curso_id",
    as: "progresos_modulos",
});
ProgresoModulo.belongsTo(curso_model_1.Curso, {
    foreignKey: "curso_id",
    as: "curso",
});
modulo_model_1.Modulo.hasMany(ProgresoModulo, {
    foreignKey: "modulo_id",
    as: "progresos_modulos",
});
ProgresoModulo.belongsTo(modulo_model_1.Modulo, {
    foreignKey: "modulo_id",
    as: "modulo",
});
