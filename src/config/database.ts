// src/config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelize: Sequelize;

// 👉 CASO 1: Railway (producción)
if (process.env.MYSQL_PUBLIC_URL) {
  console.log("🌐 Conectando a Railway MySQL...");

  sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL as string, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

// 👉 CASO 2: Local
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
    dialect: "mysql",
    host: DB_HOST,
    port: Number(DB_PORT),
    logging: false,
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
}

export default sequelize;