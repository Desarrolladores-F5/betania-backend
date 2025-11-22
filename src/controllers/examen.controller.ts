// src/controllers/examen.controller.ts
import { Request, Response } from "express";
import sequelize from "../config/database";
import { Examen } from "../models/examen.model";
import { Curso } from "../models/curso.model";
import { Pregunta } from "../models/pregunta.model";
import { Alternativa } from "../models/alternativa.model";

/* ======================================================
   📌 Listar todos los exámenes
   GET /api/admin/examenes
   ====================================================== */
export const listarExamenes = async (req: Request, res: Response) => {
  try {
    const examenes = await Examen.findAll({
      include: [
        {
          model: Curso,
          as: "curso",
          attributes: ["id", "titulo"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.json(examenes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo listar los exámenes" });
  }
};

/* ======================================================
   📌 Crear examen
   ====================================================== */
export const crearExamen = async (req: Request, res: Response) => {
  try {
    const { curso_id, titulo, tiempo_limite_seg, intento_max, publicado } =
      req.body;

    // Validar que el curso exista
    const curso = await Curso.findByPk(curso_id);
    if (!curso) {
      return res.status(400).json({ error: "curso_id inválido" });
    }

    // ⚠️ IMPORTANTE: ya NO bloqueamos por curso_id repetido.
    // Ahora permitimos múltiples exámenes por curso (uno por clase, etc.).

    const examen = await Examen.create({
      curso_id,
      titulo,
      tiempo_limite_seg: tiempo_limite_seg ?? null,
      intento_max: intento_max ?? null,
      publicado: !!publicado,
    });

    return res.status(201).json(examen);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el examen" });
  }
};

/* ======================================================
   📌 Actualizar examen (solo datos generales)
   PUT /api/admin/examenes/:id
   ====================================================== */
export const actualizarExamen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const examen = await Examen.findByPk(id);
    if (!examen)
      return res.status(404).json({ error: "Examen no encontrado" });

    await examen.update(req.body);
    return res.json(examen);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al actualizar examen" });
  }
};

/* ======================================================
   📌 Obtener examen completo (curso + preguntas + alternativas)
   GET /api/admin/examenes/:id
   ====================================================== */
export const obtenerExamenCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const examen = await Examen.findByPk(id, {
      include: [
        {
          model: Curso,
          as: "curso",
          attributes: ["id", "titulo"],
        },
        {
          model: Pregunta,
          as: "preguntas",
          include: [{ model: Alternativa, as: "alternativas" }],
        },
      ],
      order: [
        [{ model: Pregunta, as: "preguntas" }, "orden", "ASC"],
        [
          { model: Pregunta, as: "preguntas" },
          { model: Alternativa, as: "alternativas" },
          "id",
          "ASC",
        ],
      ],
    });

    if (!examen)
      return res.status(404).json({ error: "Examen no encontrado" });

    return res.json(examen);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al obtener examen" });
  }
};

/* ======================================================
   📌 Eliminar examen
   ====================================================== */
export const eliminarExamen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const examen = await Examen.findByPk(id);
    if (!examen)
      return res.status(404).json({ error: "Examen no encontrado" });

    await examen.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al eliminar examen" });
  }
};

/* ======================================================
   📌 Actualizar examen COMPLETO
   (examen + todas las preguntas + alternativas)
   PUT /api/admin/examenes/:id/full
   ====================================================== */
export const actualizarExamenCompleto = async (
  req: Request,
  res: Response
) => {
  const examenId = Number(req.params.id);

  if (!Number.isFinite(examenId)) {
    return res.status(400).json({ error: "ID de examen inválido" });
  }

  const {
    titulo,
    tiempo_limite_seg,
    intento_max,
    publicado,
    preguntas,
  } = req.body || {};

  if (!titulo || !Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({
      error:
        "Se requiere al menos título y un arreglo de preguntas para actualizar el examen completo",
    });
  }

  try {
    const resultado = await sequelize.transaction(async (t) => {
      const examen = await Examen.findByPk(examenId, { transaction: t });
      if (!examen) {
        throw new Error("NOT_FOUND");
      }

      // 1) Actualizar datos generales del examen
      const updateData: any = { titulo };
      if (tiempo_limite_seg !== undefined)
        updateData.tiempo_limite_seg = tiempo_limite_seg;
      if (intento_max !== undefined) updateData.intento_max = intento_max;
      if (publicado !== undefined) updateData.publicado = !!publicado;

      await examen.update(updateData, { transaction: t });

      // 2) Eliminar TODAS las preguntas anteriores
      await Pregunta.destroy({
        where: { examen_id: examenId },
        transaction: t,
      });

      // 3) Crear nuevamente preguntas y alternativas
      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i];

        if (!p || !p.enunciado || !Array.isArray(p.alternativas)) {
          throw new Error(
            `Pregunta inválida en posición ${i + 1}: requiere enunciado y alternativas`
          );
        }

        const pregunta = await Pregunta.create(
          {
            examen_id: examenId,
            enunciado: p.enunciado,
            puntaje:
              p.puntaje !== undefined && p.puntaje !== null ? p.puntaje : 1,
            orden:
              p.orden !== undefined && p.orden !== null ? p.orden : i + 1,
          },
          { transaction: t }
        );

        for (const alt of p.alternativas) {
          if (!alt || !alt.texto) continue;

          await Alternativa.create(
            {
              pregunta_id: pregunta.id,
              texto: alt.texto,
              es_correcta: !!alt.es_correcta,
            },
            { transaction: t }
          );
        }
      }

      // 4) Recargar examen completo actualizado
      const actualizado = await Examen.findByPk(examenId, {
        include: [
          {
            model: Curso,
            as: "curso",
            attributes: ["id", "titulo"],
          },
          {
            model: Pregunta,
            as: "preguntas",
            include: [{ model: Alternativa, as: "alternativas" }],
          },
        ],
        order: [
          [{ model: Pregunta, as: "preguntas" }, "orden", "ASC"],
          [
            { model: Pregunta, as: "preguntas" },
            { model: Alternativa, as: "alternativas" },
            "id",
            "ASC",
          ],
        ],
        transaction: t,
      });

      return actualizado;
    });

    if (!resultado) {
      return res
        .status(500)
        .json({ error: "Error inesperado al actualizar el examen" });
    }

    return res.json(resultado);
  } catch (e: any) {
    console.error("Error actualizarExamenCompleto:", e);

    if (e instanceof Error && e.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Examen no encontrado" });
    }

    return res
      .status(500)
      .json({ error: "Error al actualizar el examen completo" });
  }
};
