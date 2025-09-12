import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey
} from "sequelize";
import sequelize from "../config/database";
import { Examen } from "./examen.model";
import { Usuario } from "./usuario.model";

export class IntentoExamen extends Model<InferAttributes<IntentoExamen>, InferCreationAttributes<IntentoExamen>> {
  declare id: CreationOptional<number>;
  declare examen_id: ForeignKey<Examen["id"]>;
  declare usuario_id: ForeignKey<Usuario["id"]>;
  declare puntaje_total: number | null;
  declare aprobado: boolean | null;
  declare duracion_seg: number | null;
  declare fecha_inicio: Date;
  declare fecha_fin: Date | null;
}

IntentoExamen.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    examen_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    puntaje_total: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    aprobado: { type: DataTypes.BOOLEAN, allowNull: true },
    duracion_seg: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    fecha_inicio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_fin: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: "intentos_examen", timestamps: false }
);


// Asociaciones (para incluir en reportes)
Examen.hasMany(IntentoExamen, { foreignKey: "examen_id", as: "intentos", onDelete: "CASCADE" });
IntentoExamen.belongsTo(Examen, { foreignKey: "examen_id", as: "examen" });

Usuario.hasMany(IntentoExamen, { foreignKey: "usuario_id", as: "intentos", onDelete: "CASCADE" });
IntentoExamen.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
