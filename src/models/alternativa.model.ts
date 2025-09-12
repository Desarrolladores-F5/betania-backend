import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { Pregunta } from "./pregunta.model";

export class Alternativa extends Model<InferAttributes<Alternativa>, InferCreationAttributes<Alternativa>> {
  declare id: CreationOptional<number>;
  declare pregunta_id: ForeignKey<Pregunta["id"]>;
  declare texto: string;
  declare es_correcta: boolean;
}

Alternativa.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    pregunta_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    texto: { type: DataTypes.TEXT, allowNull: false },
    es_correcta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: "alternativas", timestamps: false }
);

Pregunta.hasMany(Alternativa, { foreignKey: "pregunta_id", as: "alternativas", onDelete: "CASCADE" });
Alternativa.belongsTo(Pregunta, { foreignKey: "pregunta_id", as: "pregunta" });
