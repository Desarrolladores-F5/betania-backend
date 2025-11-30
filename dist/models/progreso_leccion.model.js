"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgresoLeccion = void 0;
// src/models/progreso_leccion.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const usuario_model_1 = require("./usuario.model");
const curso_model_1 = require("./curso.model");
const modulo_model_1 = require("./modulo.model");
const leccion_model_1 = require("./leccion.model");
class ProgresoLeccion extends sequelize_1.Model {
}
exports.ProgresoLeccion = ProgresoLeccion;
ProgresoLeccion.init({
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
    leccion_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("bloqueada", "disponible", "completada"),
        allowNull: false,
        defaultValue: "bloqueada",
    },
    nota_ultima_prueba: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    aprobado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    tableName: "progreso_leccion",
    modelName: "ProgresoLeccion",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
});
// Asociaciones básicas
usuario_model_1.Usuario.hasMany(ProgresoLeccion, {
    foreignKey: "usuario_id",
    as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(usuario_model_1.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
});
curso_model_1.Curso.hasMany(ProgresoLeccion, {
    foreignKey: "curso_id",
    as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(curso_model_1.Curso, {
    foreignKey: "curso_id",
    as: "curso",
});
modulo_model_1.Modulo.hasMany(ProgresoLeccion, {
    foreignKey: "modulo_id",
    as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(modulo_model_1.Modulo, {
    foreignKey: "modulo_id",
    as: "modulo",
});
leccion_model_1.Leccion.hasMany(ProgresoLeccion, {
    foreignKey: "leccion_id",
    as: "progresos",
});
ProgresoLeccion.belongsTo(leccion_model_1.Leccion, {
    foreignKey: "leccion_id",
    as: "leccion",
});
