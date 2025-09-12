import { Request, Response } from "express";
import { Curso } from "../models/curso.model";
import { Modulo } from "../models/modulo.model";
import { Leccion } from "../models/leccion.model";

export const crearCurso = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion, portada_url, publicado, activo } = req.body;
    const curso = await Curso.create({
      titulo,
      descripcion: descripcion ?? null,
      portada_url: portada_url ?? null,
      publicado: !!publicado,
      activo: activo ?? true
    });
    return res.status(201).json(curso);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el curso" });
  }
};

export const listarCursosAdmin = async (_req: Request, res: Response) => {
  try {
    const cursos = await Curso.findAll({ order: [["id", "DESC"]] });
    return res.json(cursos);
  } catch {
    return res.status(500).json({ error: "Error al listar cursos" });
  }
};

export const obtenerCursoAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id, {
      include: [{ model: Modulo, as: "modulos", include: [{ model: Leccion, as: "lecciones" }] }]
    });
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    return res.json(curso);
  } catch {
    return res.status(500).json({ error: "Error al obtener curso" });
  }
};

export const actualizarCurso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    await curso.update(req.body);
    return res.json(curso);
  } catch {
    return res.status(500).json({ error: "Error al actualizar curso" });
  }
};

export const eliminarCurso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findByPk(id);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    await curso.destroy();
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error al eliminar curso" });
  }
};

// ---------- Endpoints para usuario autenticado (contenido publicado/activo) ----------
export const listarCursosPublico = async (_req: Request, res: Response) => {
  try {
    const cursos = await Curso.findAll({
      where: { activo: true, publicado: true },
      order: [["id", "DESC"]],
      attributes: ["id", "titulo", "descripcion", "portada_url"]
    });
    return res.json(cursos);
  } catch {
    return res.status(500).json({ error: "Error al listar cursos publicados" });
  }
};

export const obtenerCursoConContenido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await Curso.findOne({
      where: { id, activo: true, publicado: true },
      attributes: ["id", "titulo", "descripcion", "portada_url"],
      include: [
        {
          model: Modulo,
          as: "modulos",
          attributes: ["id", "titulo", "descripcion", "orden"],
          order: [["orden", "ASC"]],
          include: [
            {
              model: Leccion,
              as: "lecciones",
              attributes: ["id", "titulo", "descripcion", "youtube_id", "pdf_url", "orden", "publicado"],
              order: [["orden", "ASC"]]
            }
          ]
        }
      ]
    });
    if (!curso) return res.status(404).json({ error: "Curso no disponible" });
    // Filtrar lecciones no publicadas del resultado público
    const json = curso.toJSON() as any;
    json.modulos = (json.modulos || []).map((m: any) => ({
      ...m,
      lecciones: (m.lecciones || []).filter((l: any) => l.publicado === true)
    }));
    return res.json(json);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al obtener contenido del curso" });
  }
};
