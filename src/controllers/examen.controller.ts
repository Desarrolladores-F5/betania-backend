import { Request, Response } from "express";
import { Examen } from "../models/examen.model";
import { Curso } from "../models/curso.model";
import { Pregunta } from "../models/pregunta.model";
import { Alternativa } from "../models/alternativa.model";

export const crearExamen = async (req: Request, res: Response) => {
  try {
    const { curso_id, titulo, tiempo_limite_seg, intento_max, publicado } = req.body;
    const curso = await Curso.findByPk(curso_id);
    if (!curso) return res.status(400).json({ error: "curso_id inválido" });

    const existente = await Examen.findOne({ where: { curso_id } });
    if (existente) return res.status(400).json({ error: "El curso ya tiene examen" });

    const examen = await Examen.create({
      curso_id, titulo, tiempo_limite_seg: tiempo_limite_seg ?? null, intento_max: intento_max ?? null, publicado: !!publicado
    });
    return res.status(201).json(examen);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el examen" });
  }
};

export const actualizarExamen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const examen = await Examen.findByPk(id);
    if (!examen) return res.status(404).json({ error: "Examen no encontrado" });
    await examen.update(req.body);
    return res.json(examen);
  } catch {
    return res.status(500).json({ error: "Error al actualizar examen" });
  }
};

export const obtenerExamenCompleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const examen = await Examen.findByPk(id, {
      include: [{ model: Pregunta, as: "preguntas", include: [{ model: Alternativa, as: "alternativas" }] }]
    });
    if (!examen) return res.status(404).json({ error: "Examen no encontrado" });
    return res.json(examen);
  } catch {
    return res.status(500).json({ error: "Error al obtener examen" });
  }
};

export const eliminarExamen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const examen = await Examen.findByPk(id);
    if (!examen) return res.status(404).json({ error: "Examen no encontrado" });
    await examen.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar examen" });
  }
};
