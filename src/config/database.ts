// src/config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_NAME = "",
  DB_USER = "",
  DB_PASSWORD = "",
  MYSQL_URL,
} = process.env;

// ==================================================
// 🔥 MODO RAILWAY (usa MYSQL_URL)
// ==================================================
let sequelize: Sequelize;

if (MYSQL_URL) {
  console.log("🌐 Usando conexión MySQL desde Railway (MYSQL_URL)");

  sequelize = new Sequelize(MYSQL_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // ==================================================
  // 🧪 MODO LOCAL (usa variables DB_*)
  // ==================================================
  console.log("🧪 Usando conexión MySQL local");

  if (!DB_NAME || !DB_USER) {
    throw new Error("Faltan variables de entorno DB_NAME o DB_USER en .env");
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