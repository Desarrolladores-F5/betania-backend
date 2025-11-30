"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
// src/models/usuario.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const rol_model_1 = require("./rol.model");
class Usuario extends sequelize_1.Model {
}
exports.Usuario = Usuario;
Usuario.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    rut: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    nombres: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    apellido_paterno: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    apellido_materno: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    password_hash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    rol_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "usuarios",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // 1) Oculta el hash por defecto en TODAS las consultas
    defaultScope: {
        attributes: { exclude: ["password_hash"] },
    },
    // 2) Scope explícito para incluir el hash SOLO cuando lo necesites (login)
    scopes: {
        withPassword: {
            attributes: { include: ["password_hash"] },
        },
    },
    // Si prefieres índices explícitos, elimina los 'unique' de columnas y define;
    // indexes: [
    //   { unique: true, fields: ["email"] },
    //   { unique: true, fields: ["rut"] },
    // ],
});
// Asociaciones
rol_model_1.Rol.hasMany(Usuario, { foreignKey: "rol_id", as: "usuarios" });
Usuario.belongsTo(rol_model_1.Rol, { foreignKey: "rol_id", as: "rol" });
// 3) Endurecimiento adicional (opcional): evita exponer el hash si alguien hace res.json(user)
Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
};
exports.default = Usuario;
