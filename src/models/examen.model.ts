import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { Curso } from "./curso.model";

export class Examen extends Model<InferAttributes<Examen>, InferCreationAttributes<Examen>> {
  declare id: CreationOptional<number>;
  declare curso_id: ForeignKey<Curso["id"]>;
  declare titulo: string;
  declare tiempo_limite_seg: number | null;
  declare intento_max: number | null;
  declare publicado: boolean;
}

Examen.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    curso_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    tiempo_limite_seg: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    intento_max: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    publicado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: "examenes", timestamps: false }
);

// Relación con Curso
Curso.hasOne(Examen, { foreignKey: "curso_id", as: "examen", onDelete: "CASCADE" });
Examen.belongsTo(Curso, { foreignKey: "curso_id", as: "curso" });
