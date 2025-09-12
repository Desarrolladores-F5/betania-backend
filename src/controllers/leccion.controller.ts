import { Request, Response } from "express";
import { Leccion } from "../models/leccion.model";
import { Modulo } from "../models/modulo.model";

// Admin
export const crearLeccion = async (req: Request, res: Response) => {
  try {
    const { modulo_id, titulo, descripcion, youtube_id, pdf_url, orden, publicado } = req.body;
    const modulo = await Modulo.findByPk(modulo_id);
    if (!modulo) return res.status(400).json({ error: "modulo_id inválido" });

    const leccion = await Leccion.create({
      modulo_id,
      titulo,
      descripcion: descripcion ?? null,
      youtube_id: youtube_id ?? null,
      pdf_url: pdf_url ?? null,
      orden: orden ?? 1,
      publicado: !!publicado
    });
    return res.status(201).json(leccion);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear la lección" });
  }
};

export const actualizarLeccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion) return res.status(404).json({ error: "Lección no encontrada" });
    await leccion.update(req.body);
    return res.json(leccion);
  } catch {
    return res.status(500).json({ error: "Error al actualizar lección" });
  }
};

export const eliminarLeccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion) return res.status(404).json({ error: "Lección no encontrada" });
    await leccion.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar lección" });
  }
};

// Usuario: obtener lección por id (solo si pertenece a contenido publicado)
export const obtenerLeccionPublica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Para el MVP, permitimos obtener la lección por id sin volver a verificar el curso publicado,
    // pero sí exigimos que la propia lección esté marcada como publicada.
    const leccion = await Leccion.findByPk(id);
    if (!leccion || leccion.publicado !== true) {
      return res.status(404).json({ error: "Lección no disponible" });
    }
    return res.json(leccion);
  } catch {
    return res.status(500).json({ error: "Error al obtener la lección" });
  }
};
