// src/models/modulo.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import { Curso } from "./curso.model";

export class Modulo extends Model<
  InferAttributes<Modulo>,
  InferCreationAttributes<Modulo>
> {
  declare id: CreationOptional<number>;
  declare curso_id: ForeignKey<Curso["id"]>;
  declare titulo: string;
  declare descripcion: string | null;
  /** Nuevos campos para introducción del módulo */
  declare video_intro_url: string | null;
  declare pdf_intro_url: string | null;
  declare orden: number;
  declare activo: CreationOptional<boolean>;
}

Modulo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    curso_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // 🔹 Agregados 🎯
    video_intro_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    pdf_intro_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    orden: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize, tableName: "modulos", timestamps: false }
);

// Relaciones con Curso
Curso.hasMany(Modulo, {
  foreignKey: "curso_id",
  as: "modulos",
  onDelete: "CASCADE",
});
Modulo.belongsTo(Curso, { foreignKey: "curso_id", as: "curso" });
