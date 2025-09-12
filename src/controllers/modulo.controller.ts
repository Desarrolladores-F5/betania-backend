import { Request, Response } from "express";
import { Modulo } from "../models/modulo.model";
import { Curso } from "../models/curso.model";

export const crearModulo = async (req: Request, res: Response) => {
  try {
    const { curso_id, titulo, descripcion, orden } = req.body;
    // Validar curso existente
    const curso = await Curso.findByPk(curso_id);
    if (!curso) return res.status(400).json({ error: "curso_id inválido" });

    const modulo = await Modulo.create({
      curso_id,
      titulo,
      descripcion: descripcion ?? null,
      orden: orden ?? 1
    });
    return res.status(201).json(modulo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el módulo" });
  }
};

export const actualizarModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);
    if (!modulo) return res.status(404).json({ error: "Módulo no encontrado" });
    await modulo.update(req.body);
    return res.json(modulo);
  } catch {
    return res.status(500).json({ error: "Error al actualizar módulo" });
  }
};

export const eliminarModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);
    if (!modulo) return res.status(404).json({ error: "Módulo no encontrado" });
    await modulo.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar módulo" });
  }
};
