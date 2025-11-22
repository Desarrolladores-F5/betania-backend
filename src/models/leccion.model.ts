// src/models/leccion.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import { Modulo } from "./modulo.model";
import { Examen } from "./examen.model"; // 👈 IMPORTANTE

/**
 * ==============================================================
 * Modelo: Leccion
 * ==============================================================
 * Representa una lección (video, PDF, etc.) dentro de un módulo.
 * Cada lección pertenece a un único módulo.
 * Opcionalmente puede estar vinculada a un examen (examen_id).
 * ==============================================================
 */

export class Leccion extends Model<
  InferAttributes<Leccion>,
  InferCreationAttributes<Leccion>
> {
  declare id: CreationOptional<number>;
  declare modulo_id: ForeignKey<Modulo["id"]>;
  declare examen_id: ForeignKey<Examen["id"]> | null; // 👈 FK opcional al examen

  declare titulo: string;
  declare descripcion: string | null;

  // Video principal
  declare youtube_id: string | null;
  declare youtube_titulo: string | null;

  // Video adicional
  declare youtube_id_extra: string | null;
  declare youtube_titulo_extra: string | null;

  // PDF principal
  declare pdf_url: string | null;
  declare pdf_titulo: string | null;

  declare orden: number;
  declare publicado: boolean;

  // Campos de auditoría opcionales (si decides activarlos más adelante)
  declare created_at?: Date;
  declare updated_at?: Date;
}

Leccion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    modulo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    examen_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= VIDEO PRINCIPAL =================
    youtube_id: {
      type: DataTypes.STRING(255),   // 👈 AJUSTADO A 255 PARA URL COMPLETA
      allowNull: true,
      comment: "URL o ID del video de YouTube asociado (si aplica)",
    },
    youtube_titulo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Título legible del video principal",
    },

    // ================= VIDEO ADICIONAL =================
    youtube_id_extra: {
      type: DataTypes.STRING(255),   // 👈 AJUSTADO A 255 PARA URL COMPLETA
      allowNull: true,
      comment: "URL o ID de un segundo video de YouTube (opcional)",
    },
    youtube_titulo_extra: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Título legible del video adicional",
    },

    // ====================== PDF ========================
    pdf_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "Ruta o URL del material PDF (si aplica)",
    },
    pdf_titulo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Título legible del PDF principal",
    },

    // ================= ORDEN / ESTADO ==================
    orden: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "lecciones",
    timestamps: false,
    underscored: true,
    modelName: "Leccion",
  }
);

// ========================= RELACIONES =========================
Modulo.hasMany(Leccion, {
  foreignKey: "modulo_id",
  as: "lecciones",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Leccion.belongsTo(Modulo, {
  foreignKey: "modulo_id",
  as: "modulo",
});

Examen.hasMany(Leccion, {
  foreignKey: "examen_id",
  as: "lecciones",
});

Leccion.belongsTo(Examen, {
  foreignKey: "examen_id",
  as: "examen",
});
