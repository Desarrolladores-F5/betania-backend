import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

export class Curso extends Model<
  InferAttributes<Curso>,
  InferCreationAttributes<Curso>
> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare descripcion: string | null;
  declare portada_url: string | null;
  declare publicado: boolean;
  declare activo: boolean;

  // 👇 AHORA SÍ forman parte real del modelo
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

    // 👇 DEFINIDOS EXPLÍCITAMENTE
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "cursos",

    // 🔥 CLAVE
    timestamps: false,
  }
);

export default Curso;