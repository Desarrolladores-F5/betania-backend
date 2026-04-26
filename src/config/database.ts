// src/config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize: Sequelize;

// 👉 CONFIGURACIÓN GLOBAL (CLAVE DEL FIX)
const commonConfig = {
  dialect: "mysql" as const,
  logging: false,

  // 🔥 SOLUCIÓN DEFINITIVA PARA TIMESTAMPS
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
};

// 👉 PRODUCCIÓN (Railway)
if (process.env.MYSQL_PUBLIC_URL) {
  console.log("🌐 Conectando a Railway MySQL...");

  sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
    ...commonConfig,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

// 👉 LOCAL
} else {
  console.log("💻 Conectando a MySQL local...");

  const {
    DB_HOST = "127.0.0.1",
    DB_PORT = "3306",
    DB_NAME = "",
    DB_USER = "",
    DB_PASSWORD = "",
  } = process.env;

  if (!DB_NAME || !DB_USER) {
    throw new Error("Faltan variables DB_NAME o DB_USER");
  }

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    ...commonConfig,
    host: DB_HOST,
    port: Number(DB_PORT),
  });
}

export default sequelize;