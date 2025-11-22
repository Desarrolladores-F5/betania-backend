// src/config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3308",
  DB_NAME = "",
  DB_USER = "",
  DB_PASSWORD = "",
} = process.env;

// Validaciones mínimas
if (!DB_NAME || !DB_USER) {
  throw new Error("Faltan variables de entorno DB_NAME o DB_USER en .env");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
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

export default sequelize;
