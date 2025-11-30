// src/models/progreso_modulo.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import { Usuario } from "./usuario.model";
import { Curso } from "./curso.model";
import { Modulo } from "./modulo.model";

export class ProgresoModulo extends Model<
  InferAttributes<ProgresoModulo>,
  InferCreationAttributes<ProgresoModulo>
> {
  declare id: CreationOptional<number>;

  declare usuario_id: ForeignKey<Usuario["id"]>;
  declare curso_id: ForeignKey<Curso["id"]>;
  declare modulo_id: ForeignKey<Modulo["id"]>;

  declare estado: "bloqueado" | "disponible" | "completado";
  declare fecha_desbloqueo: Date | null;
  declare fecha_completado: Date | null;

  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

ProgresoModulo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    curso_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    modulo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("bloqueado", "disponible", "completado"),
      allowNull: false,
      defaultValue: "bloqueado",
    },
    fecha_desbloqueo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_completado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
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
    tableName: "progreso_modulo",
    modelName: "ProgresoModulo",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  }
);

// Asociaciones básicas
Usuario.hasMany(ProgresoModulo, {
  foreignKey: "usuario_id",
  as: "progresos_modulos",
});
ProgresoModulo.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Curso.hasMany(ProgresoModulo, {
  foreignKey: "curso_id",
  as: "progresos_modulos",
});
ProgresoModulo.belongsTo(Curso, {
  foreignKey: "curso_id",
  as: "curso",
});

Modulo.hasMany(ProgresoModulo, {
  foreignKey: "modulo_id",
  as: "progresos_modulos",
});
ProgresoModulo.belongsTo(Modulo, {
  foreignKey: "modulo_id",
  as: "modulo",
});
