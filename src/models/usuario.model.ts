// src/models/usuario.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute, // para tipar asociaciones no persistentes
} from "sequelize";
import sequelize from "../config/database";
import { Rol } from "./rol.model";

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: CreationOptional<number>;

  // Datos personales
  declare rut: string;
  declare telefono: string | null;
  declare nombres: string;
  declare apellido_paterno: string | null;
  declare apellido_materno: string | null;
  declare email: string;
  declare fecha_nacimiento: string | null; // 'YYYY-MM-DD'

  // Seguridad / estado
  declare password_hash: string;
  declare rol_id: ForeignKey<Rol["id"]>;
  declare activo: CreationOptional<boolean>;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Asociación (NO es columna)
  declare rol?: NonAttribute<Rol>;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    rut: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido_paterno: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apellido_materno: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    rol_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    // 1) Oculta el hash por defecto en TODAS las consultas
    defaultScope: {
      attributes: { exclude: ["password_hash"] },
    },

    // 2) Scope explícito para incluir el hash SOLO cuando lo necesites (login)
    scopes: {
      withPassword: {
        attributes: { include: ["password_hash"] },
      },
    },

    // Si prefieres índices explícitos, elimina los 'unique' de columnas y define;
    // indexes: [
    //   { unique: true, fields: ["email"] },
    //   { unique: true, fields: ["rut"] },
    // ],
  }
);

// Asociaciones
Rol.hasMany(Usuario, { foreignKey: "rol_id", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rol_id", as: "rol" });

// 3) Endurecimiento adicional (opcional): evita exponer el hash si alguien hace res.json(user)
Usuario.prototype.toJSON = function () {
  const values = { ...this.get() } as any;
  delete values.password_hash;
  return values;
};

export default Usuario;
