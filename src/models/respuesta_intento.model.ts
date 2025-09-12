import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { IntentoExamen } from "./intento_examen.model";
import { Pregunta } from "./pregunta.model";
import { Alternativa } from "./alternativa.model";

export class RespuestaIntento extends Model<InferAttributes<RespuestaIntento>, InferCreationAttributes<RespuestaIntento>> {
  declare id: CreationOptional<number>;
  declare intento_id: ForeignKey<IntentoExamen["id"]>;
  declare pregunta_id: ForeignKey<Pregunta["id"]>;
  declare alternativa_id: ForeignKey<Alternativa["id"]>;
  declare correcta: boolean;
  declare puntaje_obtenido: number;
}

RespuestaIntento.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    intento_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pregunta_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    alternativa_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    correcta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    puntaje_obtenido: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: "respuestas_intento", timestamps: false }
);

// Relaciones
IntentoExamen.hasMany(RespuestaIntento, { foreignKey: "intento_id", as: "respuestas", onDelete: "CASCADE" });
RespuestaIntento.belongsTo(IntentoExamen, { foreignKey: "intento_id", as: "intento" });
