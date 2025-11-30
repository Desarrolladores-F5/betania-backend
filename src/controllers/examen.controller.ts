// src/controllers/examen.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import { Examen } from "../models/examen.model";
import { Curso } from "../models/curso.model";
import { Pregunta } from "../models/pregunta.model";
import { Alternativa } from "../models/alternativa.model";
import { Leccion } from "../models/leccion.model";
import { Modulo } from "../models/modulo.model";
import { ProgresoLeccion } from "../models/progreso_leccion.model";

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

    // Ahora permitimos múltiples exámenes por curso.
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

/* ======================================================
   📌 Obtener PRUEBA asociada a una lección (ALUMNO)
   GET /api/cursos/leccion/:id/prueba
   ====================================================== */
export const obtenerPruebaLeccionUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const leccionId = Number(req.params.id);

    if (!Number.isFinite(leccionId)) {
      return res.status(400).json({ error: "ID de lección inválido" });
    }

    // 1) Buscar la lección
    const leccion = await Leccion.findByPk(leccionId);
    if (!leccion) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }

    const examenId = (leccion as any).examen_id;
    if (!examenId) {
      return res
        .status(404)
        .json({ error: "La lección no tiene examen asociado" });
    }

    // 2) Buscar el examen con sus preguntas + alternativas
    const examen = await Examen.findByPk(examenId, {
      include: [
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

    if (!examen) {
      return res.status(404).json({ error: "Examen no encontrado" });
    }

    // 3) Opcional: validar que esté publicado
    if (!examen.publicado) {
      return res
        .status(403)
        .json({ error: "La evaluación aún no está disponible" });
    }

    // 4) Devolver datos “limpios” para el alumno
    const json = examen.toJSON() as any;

    const respuesta = {
      id: json.id,
      titulo: json.titulo,
      tiempo_limite_seg: json.tiempo_limite_seg ?? null,
      intento_max: json.intento_max ?? null,
      preguntas: Array.isArray(json.preguntas)
        ? json.preguntas.map((p: any) => ({
            id: p.id,
            enunciado: p.enunciado,
            puntaje: p.puntaje ?? 1,
            alternativas: Array.isArray(p.alternativas)
              ? p.alternativas.map((a: any) => ({
                  id: a.id,
                  texto: a.texto,
                  // ⚠️ No enviamos es_correcta al alumno
                }))
              : [],
          }))
        : [],
    };

    return res.json(respuesta);
  } catch (e) {
    console.error("Error obtenerPruebaLeccionUsuario:", e);
    return res
      .status(500)
      .json({ error: "Error al obtener la prueba de la lección" });
  }
};

/* ======================================================
   📌 Responder PRUEBA de una lección (ALUMNO)
   POST /api/cursos/leccion/:id/prueba/responder
   Body esperado:
   {
     respuestas: [
       { pregunta_id: number, alternativa_id: number },
       ...
     ]
   }
   ====================================================== */
export const responderPruebaLeccion = async (
  req: Request,
  res: Response
) => {
  try {
    const leccionId = Number(req.params.id);

    if (!Number.isFinite(leccionId)) {
      return res.status(400).json({ error: "ID de lección inválido" });
    }

    const respuestas = Array.isArray(req.body?.respuestas)
      ? req.body.respuestas
      : null;

    if (!respuestas || respuestas.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar un arreglo de respuestas" });
    }

    // Usuario autenticado (requireAuth en el router)
    const user = req.user as any;
    if (!user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const usuarioId = Number(user.id);

    // 1) Buscar la lección y su examen asociado
    const leccion = await Leccion.findByPk(leccionId);
    if (!leccion) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }

    const examenId = (leccion as any).examen_id;
    if (!examenId) {
      return res
        .status(404)
        .json({ error: "La lección no tiene examen asociado" });
    }

    // Necesitamos modulo_id y curso_id para progreso
    const leccionJson = leccion.toJSON() as any;
    const moduloId = Number(leccionJson.modulo_id);
    if (!Number.isFinite(moduloId)) {
      return res
        .status(500)
        .json({ error: "La lección no tiene módulo asociado válido" });
    }

    const modulo = await Modulo.findByPk(moduloId);
    if (!modulo) {
      return res
        .status(500)
        .json({ error: "No se encontró el módulo asociado a la lección" });
    }

    const moduloJson = modulo.toJSON() as any;
    const cursoId = Number(moduloJson.curso_id);
    if (!Number.isFinite(cursoId)) {
      return res
        .status(500)
        .json({ error: "El módulo no tiene curso asociado válido" });
    }

    // 2) Cargar examen con preguntas + alternativas
    const examen = await Examen.findByPk(examenId, {
      include: [
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

    if (!examen) {
      return res.status(404).json({ error: "Examen no encontrado" });
    }

    const preguntas = ((examen.toJSON() as any).preguntas ?? []) as any[];

    if (!Array.isArray(preguntas) || preguntas.length === 0) {
      return res
        .status(400)
        .json({ error: "El examen no tiene preguntas configuradas" });
    }

    // 3) Construir mapa de alternativas correctas por pregunta
    const alternativasCorrectas = new Map<number, Set<number>>();
    for (const p of preguntas) {
      const pid = Number(p.id);
      if (!Number.isFinite(pid)) continue;

      const set = new Set<number>();
      if (Array.isArray(p.alternativas)) {
        for (const alt of p.alternativas) {
          if (alt?.es_correcta) {
            const aid = Number(alt.id);
            if (Number.isFinite(aid)) set.add(aid);
          }
        }
      }
      alternativasCorrectas.set(pid, set);
    }

    // 4) Corregir respuestas
    type RespuestaPayload = {
      pregunta_id: number;
      alternativa_id: number;
    };

    let correctas = 0;
    const detalle: {
      pregunta_id: number;
      alternativa_id: number;
      es_correcta: boolean;
    }[] = [];

    for (const r of respuestas as RespuestaPayload[]) {
      const preguntaId = Number(r.pregunta_id);
      const alternativaId = Number(r.alternativa_id);
      if (!Number.isFinite(preguntaId) || !Number.isFinite(alternativaId)) {
        continue;
      }

      const setCorrectas = alternativasCorrectas.get(preguntaId);
      const esCorrecta = !!setCorrectas && setCorrectas.has(alternativaId);
      if (esCorrecta) correctas++;

      detalle.push({
        pregunta_id: preguntaId,
        alternativa_id: alternativaId,
        es_correcta: esCorrecta,
      });
    }

    const totalPreguntas = preguntas.length;
    const incorrectas = totalPreguntas - correctas;
    const porcentaje =
      totalPreguntas > 0
        ? Math.round((correctas * 100) / totalPreguntas)
        : 0;

    // Regla simple de aprobación (puedes cambiarla: 60% por ejemplo)
    const aprobado = porcentaje >= 60;

    // 5) Actualizar progreso de la lección actual
    const ahora = new Date();

    const [progActual] = await ProgresoLeccion.findOrCreate({
      where: {
        usuario_id: usuarioId,
        curso_id: cursoId,
        modulo_id: moduloId,
        leccion_id: leccionId,
      },
      defaults: {
        estado: "disponible",
        nota_ultima_prueba: null,
        aprobado: false,
        fecha_completado: null,
      },
    });

    let nuevoEstado: "bloqueada" | "disponible" | "completada" =
      progActual.estado;
    let fechaCompletado: Date | null = progActual.fecha_completado;

    if (aprobado) {
      nuevoEstado = "completada";
      fechaCompletado = ahora;
    } else {
      // Si aún estaba bloqueada, la dejamos al menos disponible para reintentar
      if (progActual.estado === "bloqueada") {
        nuevoEstado = "disponible";
      } else {
        nuevoEstado = progActual.estado;
      }
    }

    await progActual.update({
      estado: nuevoEstado,
      aprobado,
      nota_ultima_prueba: porcentaje,
      fecha_completado: fechaCompletado,
    });

    // 6) Si aprobó, desbloquear la siguiente lección del mismo módulo
    let siguienteLeccionId: number | null = null;

    if (aprobado) {
      // Necesitamos conocer el orden de la lección actual
      const ordenActual = Number(leccionJson.orden);
      const leccionSiguiente = await Leccion.findOne({
        where: {
          modulo_id: moduloId,
          orden: { [Op.gt]: ordenActual },
          publicado: true,
        },
        order: [
          ["orden", "ASC"],
          ["id", "ASC"],
        ],
      });

      if (leccionSiguiente) {
        siguienteLeccionId = Number(leccionSiguiente.id);

        const [progSiguiente, creado] = await ProgresoLeccion.findOrCreate({
          where: {
            usuario_id: usuarioId,
            curso_id: cursoId,
            modulo_id: moduloId,
            leccion_id: siguienteLeccionId,
          },
          defaults: {
            estado: "disponible",
            aprobado: false,
            nota_ultima_prueba: null,
            fecha_completado: null,
          },
        });

        if (!creado && progSiguiente.estado === "bloqueada") {
          await progSiguiente.update({
            estado: "disponible",
            aprobado: false,
          });
        }
      }
    }

    // 7) Respuesta al frontend
    return res.json({
      leccion_id: leccionId,
      examen_id: examenId,
      total_preguntas: totalPreguntas,
      correctas,
      incorrectas,
      porcentaje,
      aprobado,
      detalle,
      progreso: {
        estado_leccion: nuevoEstado,
        nota_ultima_prueba: porcentaje,
      },
      siguiente_leccion: siguienteLeccionId
        ? { id: siguienteLeccionId, desbloqueada: true }
        : null,
    });
  } catch (e) {
    console.error("Error responderPruebaLeccion:", e);
    return res
      .status(500)
      .json({ error: "Error al procesar la respuesta de la prueba" });
  }
};
