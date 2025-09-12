import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER) {
  throw new Error("Faltan variables de entorno de DB en .env");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD ?? "", {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "mysql",
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: true
  }
});

export default sequelize;
