import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

export class Curso extends Model<
  InferAttributes<Curso, { omit: "created_at" | "updated_at" }>,
  InferCreationAttributes<Curso, { omit: "created_at" | "updated_at" }>
> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare descripcion: string | null;
  declare portada_url: string | null;
  declare publicado: boolean;
  declare activo: boolean;

  // Sequelize los maneja automáticamente
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Curso.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    portada_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "cursos",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    hooks: {
      beforeCreate: (instance: any) => {
        instance.created_at = new Date();
        instance.updated_at = new Date();
      },
      beforeUpdate: (instance: any) => {
        instance.updated_at = new Date();
      },
    },
  }
);