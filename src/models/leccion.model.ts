import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { Modulo } from "./modulo.model";

export class Leccion extends Model<InferAttributes<Leccion>, InferCreationAttributes<Leccion>> {
  declare id: CreationOptional<number>;
  declare modulo_id: ForeignKey<Modulo["id"]>;
  declare titulo: string;
  declare descripcion: string | null;
  declare youtube_id: string | null;
  declare pdf_url: string | null;
  declare orden: number;
  declare publicado: boolean;
}

Leccion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    modulo_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    youtube_id: { type: DataTypes.STRING(64), allowNull: true },
    pdf_url: { type: DataTypes.STRING(1024), allowNull: true },
    orden: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    publicado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: "lecciones", timestamps: false }
);

// Relaciones con Módulo
Modulo.hasMany(Leccion, { foreignKey: "modulo_id", as: "lecciones", onDelete: "CASCADE" });
Leccion.belongsTo(Modulo, { foreignKey: "modulo_id", as: "modulo" });
