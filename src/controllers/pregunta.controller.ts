import { Request, Response } from "express";
import { Pregunta } from "../models/pregunta.model";
import { Examen } from "../models/examen.model";

export const crearPregunta = async (req: Request, res: Response) => {
  try {
    const { examen_id, enunciado, puntaje, orden } = req.body;
    const ex = await Examen.findByPk(examen_id);
    if (!ex) return res.status(400).json({ error: "examen_id inválido" });

    const pregunta = await Pregunta.create({
      examen_id, enunciado, puntaje: puntaje ?? 1, orden: orden ?? 1
    });
    return res.status(201).json(pregunta);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear la pregunta" });
  }
};

export const actualizarPregunta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });
    await pregunta.update(req.body);
    return res.json(pregunta);
  } catch {
    return res.status(500).json({ error: "Error al actualizar pregunta" });
  }
};

export const eliminarPregunta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pregunta = await Pregunta.findByPk(id);
    if (!pregunta) return res.status(404).json({ error: "Pregunta no encontrada" });
    await pregunta.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar pregunta" });
  }
};
