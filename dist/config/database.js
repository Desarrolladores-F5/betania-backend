"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/database.ts
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_HOST = "127.0.0.1", DB_PORT = "3308", DB_NAME = "", DB_USER = "", DB_PASSWORD = "", } = process.env;
// Validaciones mínimas
if (!DB_NAME || !DB_USER) {
    throw new Error("Faltan variables de entorno DB_NAME o DB_USER en .env");
}
const sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    dialect: "mysql",
    host: DB_HOST,
    port: Number(DB_PORT),
    logging: false,
    // Importante: sin socketPath => fuerza TCP
    pool: {
        max: 10,
        min: 0,
        acquire: 20000,
        idle: 10000,
    },
    define: {
        underscored: true,
        timestamps: true,
        freezeTableName: true,
    },
});
exports.default = sequelize;
