// src/controllers/leccion.controller.ts
import { Request, Response } from "express";
import { Leccion } from "../models/leccion.model";
import { Modulo } from "../models/modulo.model";

/* =========================
 *  ADMIN – LISTAR (opcionalmente por módulo)
 *  GET /api/admin/lecciones?modulo_id=4
 * ========================= */
export const listarLecciones = async (req: Request, res: Response) => {
  try {
    const { modulo_id } = req.query;
    const where: any = {};
    if (modulo_id != null) where.modulo_id = Number(modulo_id);

    const lecciones = await Leccion.findAll({
      where,
      order: [
        ["orden", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json(lecciones);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al listar lecciones" });
  }
};

/* =========================
 *  ADMIN – OBTENER POR ID
 *  GET /api/admin/lecciones/:id
 * ========================= */
export const obtenerLeccionAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion)
      return res.status(404).json({ error: "Lección no encontrada" });
    return res.json(leccion);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al obtener la lección" });
  }
};

/* =========================
 *  ADMIN – LISTAR POR MÓDULO
 *  GET /api/admin/modulos/:moduloId/lecciones
 * ========================= */
export const listarLeccionesPorModulo = async (req: Request, res: Response) => {
  try {
    const moduloId = Number(req.params.moduloId);
    const modulo = await Modulo.findByPk(moduloId);
    if (!modulo)
      return res.status(404).json({ error: "Módulo no encontrado" });

    const lecciones = await Leccion.findAll({
      where: { modulo_id: moduloId },
      order: [
        ["orden", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json({ modulo, lecciones });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Error al listar lecciones del módulo" });
  }
};

/* =========================
 *  ADMIN – CREAR
 * ========================= */
export const crearLeccion = async (req: Request, res: Response) => {
  try {
    const {
      modulo_id,
      examen_id,              // 👈 opcional
      titulo,
      descripcion,
      youtube_id,
      youtube_titulo,
      youtube_id_extra,
      youtube_titulo_extra,
      pdf_url,
      pdf_titulo,
      orden,
      publicado,
    } = req.body;

    const modulo = await Modulo.findByPk(modulo_id);
    if (!modulo) return res.status(400).json({ error: "modulo_id inválido" });

    const leccion = await Leccion.create({
      modulo_id,
      examen_id: examen_id ?? null, // 👈 guarda FK al examen si viene
      titulo,
      descripcion: descripcion ?? null,
      youtube_id: youtube_id ?? null,
      youtube_titulo: youtube_titulo ?? null,
      youtube_id_extra: youtube_id_extra ?? null,
      youtube_titulo_extra: youtube_titulo_extra ?? null,
      pdf_url: pdf_url ?? null,
      pdf_titulo: pdf_titulo ?? null,
      orden: orden ?? 1,
      publicado: !!publicado,
    });

    return res.status(201).json(leccion);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear la lección" });
  }
};

/* =========================
 *  ADMIN – ACTUALIZAR
 * ========================= */
export const actualizarLeccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion)
      return res.status(404).json({ error: "Lección no encontrada" });

    await leccion.update({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion ?? null,
      youtube_id: req.body.youtube_id ?? null,
      youtube_titulo: req.body.youtube_titulo ?? null,
      youtube_id_extra: req.body.youtube_id_extra ?? null,
      youtube_titulo_extra: req.body.youtube_titulo_extra ?? null,
      pdf_url: req.body.pdf_url ?? null,
      pdf_titulo: req.body.pdf_titulo ?? null,
      orden: req.body.orden ?? leccion.orden,
      publicado:
        req.body.publicado !== undefined
          ? req.body.publicado
          : leccion.publicado,
      // 👇 clave para vincular la prueba creada a la lección
      examen_id:
        req.body.examen_id !== undefined
          ? req.body.examen_id
          : leccion.examen_id,
    });

    return res.json(leccion);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al actualizar lección" });
  }
};

/* =========================
 *  ADMIN – ELIMINAR
 * ========================= */
export const eliminarLeccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion)
      return res.status(404).json({ error: "Lección no encontrada" });

    await leccion.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al eliminar lección" });
  }
};

/* =========================
 *  USUARIO – PUBLICA
 * ========================= */
export const obtenerLeccionPublica = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await Leccion.findByPk(id);
    if (!leccion || leccion.publicado !== true) {
      return res.status(404).json({ error: "Lección no disponible" });
    }
    return res.json(leccion);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al obtener la lección" });
  }
};
