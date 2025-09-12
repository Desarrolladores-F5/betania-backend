import { Request, Response } from "express";
import { Alternativa } from "../models/alternativa.model";
import { Pregunta } from "../models/pregunta.model";

export const crearAlternativa = async (req: Request, res: Response) => {
  try {
    const { pregunta_id, texto, es_correcta } = req.body;
    const p = await Pregunta.findByPk(pregunta_id);
    if (!p) return res.status(400).json({ error: "pregunta_id inválido" });

    const alternativa = await Alternativa.create({
      pregunta_id, texto, es_correcta: !!es_correcta
    });
    return res.status(201).json(alternativa);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear la alternativa" });
  }
};

export const actualizarAlternativa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alt = await Alternativa.findByPk(id);
    if (!alt) return res.status(404).json({ error: "Alternativa no encontrada" });
    await alt.update(req.body);
    return res.json(alt);
  } catch {
    return res.status(500).json({ error: "Error al actualizar alternativa" });
  }
};

export const eliminarAlternativa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alt = await Alternativa.findByPk(id);
    if (!alt) return res.status(404).json({ error: "Alternativa no encontrada" });
    await alt.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar alternativa" });
  }
};
