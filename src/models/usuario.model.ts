// src/models/usuario.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import { Rol } from "./rol.model";

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: CreationOptional<number>;

  // 🆕 Nuevos campos
  declare rut: string;
  declare telefono: string | null;

  declare nombres: string;
  declare apellido_paterno: string | null;
  declare apellido_materno: string | null;
  declare email: string;
  declare fecha_nacimiento: string | null; // 'YYYY-MM-DD'
  declare password_hash: string;
  declare rol_id: ForeignKey<Rol["id"]>;
  declare activo: CreationOptional<boolean>;

  // timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    // 🆕 rut/telefono
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
    // puedes dejar los unique en cada columna; si prefieres índices explícitos, usa este arreglo:
    indexes: [
      { unique: true, fields: ["email"] },
      { unique: true, fields: ["rut"] },
    ],
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Asociaciones
Rol.hasMany(Usuario, { foreignKey: "rol_id", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rol_id", as: "rol" });

export default Usuario;
