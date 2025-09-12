import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { Examen } from "./examen.model";

export class Pregunta extends Model<InferAttributes<Pregunta>, InferCreationAttributes<Pregunta>> {
  declare id: CreationOptional<number>;
  declare examen_id: ForeignKey<Examen["id"]>;
  declare enunciado: string;
  declare puntaje: number;
  declare orden: number;
}

Pregunta.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    examen_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    enunciado: { type: DataTypes.TEXT, allowNull: false },
    puntaje: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 1 },
    orden: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
  },
  { sequelize, tableName: "preguntas", timestamps: false }
);

Examen.hasMany(Pregunta, { foreignKey: "examen_id", as: "preguntas", onDelete: "CASCADE" });
Pregunta.belongsTo(Examen, { foreignKey: "examen_id", as: "examen" });
