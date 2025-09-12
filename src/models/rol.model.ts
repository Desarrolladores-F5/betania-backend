import {
  Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional
} from "sequelize";
import sequelize from "../config/database";

export class Rol extends Model<InferAttributes<Rol>, InferCreationAttributes<Rol>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Rol.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: "roles" }
);
