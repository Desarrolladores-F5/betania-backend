// src/models/progreso_leccion.model.ts
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
import { Leccion } from "./leccion.model";

export class ProgresoLeccion extends Model<
  InferAttributes<ProgresoLeccion>,
  InferCreationAttributes<ProgresoLeccion>
> {
  declare id: CreationOptional<number>;

  declare usuario_id: ForeignKey<Usuario["id"]>;
  declare curso_id: ForeignKey<Curso["id"]>;
  declare modulo_id: ForeignKey<Modulo["id"]>;
  declare leccion_id: ForeignKey<Leccion["id"]>;

  declare estado: "bloqueada" | "disponible" | "completada";
  declare nota_ultima_prueba: number | null;
  declare aprobado: boolean;
  declare fecha_completado: Date | null;

  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

ProgresoLeccion.init(
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
    leccion_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("bloqueada", "disponible", "completada"),
      allowNull: false,
      defaultValue: "bloqueada",
    },
    nota_ultima_prueba: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    aprobado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "progreso_leccion",
    modelName: "ProgresoLeccion",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  }
);

// Asociaciones básicas
Usuario.hasMany(ProgresoLeccion, {
  foreignKey: "usuario_id",
  as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Curso.hasMany(ProgresoLeccion, {
  foreignKey: "curso_id",
  as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(Curso, {
  foreignKey: "curso_id",
  as: "curso",
});

Modulo.hasMany(ProgresoLeccion, {
  foreignKey: "modulo_id",
  as: "progresos_lecciones",
});
ProgresoLeccion.belongsTo(Modulo, {
  foreignKey: "modulo_id",
  as: "modulo",
});

Leccion.hasMany(ProgresoLeccion, {
  foreignKey: "leccion_id",
  as: "progresos",
});
ProgresoLeccion.belongsTo(Leccion, {
  foreignKey: "leccion_id",
  as: "leccion",
});
