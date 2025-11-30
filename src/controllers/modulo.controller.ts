// src/controllers/modulo.controller.ts
import { Request, Response } from "express";
import { Modulo } from "../models/modulo.model";
import { Curso } from "../models/curso.model";
import { Leccion } from "../models/leccion.model";
import { ProgresoModulo } from "../models/progreso_modulo.model";
import { ProgresoLeccion } from "../models/progreso_leccion.model";

// -----------------------------------------------------------------------------
// POST /api/admin/modulos
// -----------------------------------------------------------------------------
export const crearModulo = async (req: Request, res: Response) => {
  try {
    const {
      curso_id,
      titulo,
      descripcion,
      orden,
      activo,
      video_intro_url,
      pdf_intro_url,
    } = req.body ?? {};

    const parsedCursoId = Number(curso_id);
    if (!Number.isFinite(parsedCursoId)) {
      return res.status(400).json({ error: "curso_id debe ser number" });
    }

    if (typeof titulo !== "string" || !titulo.trim()) {
      return res.status(400).json({ error: "titulo es requerido" });
    }

    const curso = await Curso.findByPk(parsedCursoId);
    if (!curso) {
      return res.status(400).json({ error: "curso_id inválido" });
    }

    const finalVideoIntroUrl =
      typeof video_intro_url === "string" && video_intro_url.trim().length > 0
        ? video_intro_url.trim()
        : null;

    let finalPdfIntroUrl: string | null = null;

    if (req.file) {
      finalPdfIntroUrl = `/uploads/pdfs/${req.file.filename}`;
    } else if (
      typeof pdf_intro_url === "string" &&
      pdf_intro_url.trim().length > 0
    ) {
      finalPdfIntroUrl = pdf_intro_url.trim();
    }

    const parsedOrden =
      typeof orden === "number" && Number.isFinite(orden) ? orden : 1;

    const parsedActivo = typeof activo === "boolean" ? activo : true;

    const modulo = await Modulo.create({
      curso_id: parsedCursoId,
      titulo: titulo.trim(),
      descripcion: typeof descripcion === "string" ? descripcion : null,
      orden: parsedOrden,
      activo: parsedActivo,
      video_intro_url: finalVideoIntroUrl,
      pdf_intro_url: finalPdfIntroUrl,
    });

    return res.status(201).json(modulo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el módulo" });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/admin/modulos/:id
// -----------------------------------------------------------------------------
export const actualizarModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }

    const {
      curso_id,
      titulo,
      descripcion,
      orden,
      activo,
      video_intro_url,
      pdf_intro_url,
    } = req.body ?? {};

    const payload: {
      curso_id?: number;
      titulo?: string;
      descripcion?: string | null;
      orden?: number;
      activo?: boolean;
      video_intro_url?: string | null;
      pdf_intro_url?: string | null;
    } = {};

    if (curso_id !== undefined) {
      const parsedCursoId = Number(curso_id);
      if (!Number.isFinite(parsedCursoId)) {
        return res.status(400).json({ error: "curso_id debe ser number" });
      }
      const curso = await Curso.findByPk(parsedCursoId);
      if (!curso) {
        return res.status(400).json({ error: "curso_id inválido" });
      }
      payload.curso_id = parsedCursoId;
    }

    if (titulo !== undefined) {
      if (typeof titulo !== "string" || !titulo.trim()) {
        return res.status(400).json({ error: "titulo inválido" });
      }
      payload.titulo = titulo.trim();
    }

    if (descripcion !== undefined) {
      payload.descripcion =
        typeof descripcion === "string" ? descripcion : null;
    }

    if (orden !== undefined) {
      const parsedOrden = Number(orden);
      if (!Number.isFinite(parsedOrden)) {
        return res.status(400).json({ error: "orden debe ser number" });
      }
      payload.orden = parsedOrden;
    }

    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return res.status(400).json({ error: "activo debe ser boolean" });
      }
      payload.activo = activo;
    }

    if (video_intro_url !== undefined) {
      payload.video_intro_url =
        typeof video_intro_url === "string" &&
        video_intro_url.trim().length > 0
          ? video_intro_url.trim()
          : null;
    }

    if (req.file) {
      payload.pdf_intro_url = `/uploads/pdfs/${req.file.filename}`;
    } else if (pdf_intro_url !== undefined) {
      payload.pdf_intro_url =
        typeof pdf_intro_url === "string" &&
        pdf_intro_url.trim().length > 0
          ? pdf_intro_url.trim()
          : null;
    }

    await modulo.update(payload);
    return res.json(modulo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al actualizar módulo" });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/admin/modulos/:id
// -----------------------------------------------------------------------------
export const eliminarModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }
    await modulo.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al eliminar módulo" });
  }
};

// -----------------------------------------------------------------------------
// GET /api/admin/modulos
// -----------------------------------------------------------------------------
export const listarModulos = async (_req: Request, res: Response) => {
  try {
    const modulos = await Modulo.findAll({ order: [["id", "DESC"]] });
    return res.json(modulos);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "No se pudieron listar los módulos" });
  }
};

// -----------------------------------------------------------------------------
// GET /api/admin/modulos/:id
// -----------------------------------------------------------------------------
export const obtenerModuloPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }
    return res.json(modulo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error al obtener módulo" });
  }
};

// -----------------------------------------------------------------------------
// GET /api/admin/cursos/:cursoId/modulos
// -----------------------------------------------------------------------------
export const listarModulosPorCurso = async (req: Request, res: Response) => {
  try {
    const cursoId = Number(req.params.cursoId);
    if (!Number.isFinite(cursoId)) {
      return res.status(400).json({ error: "cursoId inválido" });
    }

    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const modulos = await Modulo.findAll({
      where: { curso_id: cursoId },
      order: [
        ["orden", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json({ curso, modulos });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "No se pudieron listar los módulos del curso",
    });
  }
};

// =====================================================================
//  ENDPOINT ALUMNO: GET /api/cursos/:cursoId/modulos/:moduloId
// =====================================================================
export const obtenerModuloAlumno = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const usuarioId = Number(user.id);

    const { cursoId, moduloId } = req.params;

    const cursoIdNum = Number(cursoId);
    const moduloIdNum = Number(moduloId);

    if (!Number.isFinite(cursoIdNum) || !Number.isFinite(moduloIdNum)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // 1) Buscar el módulo con sus lecciones, asegurando que pertenece al curso
    const modulo = await Modulo.findOne({
      where: { id: moduloIdNum, curso_id: cursoIdNum },
      attributes: [
        "id",
        "curso_id",
        "titulo",
        "descripcion",
        "orden",
        "video_intro_url", // 👈 nuevos campos
        "pdf_intro_url",   // 👈
      ],
      include: [
        {
          model: Leccion,
          as: "lecciones",
          attributes: [
            "id",
            "titulo",
            "descripcion",
            "orden",
            "youtube_id",
            "pdf_url",
            "publicado",
          ],
        },
      ],
    });

    if (!modulo) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }

    // 2) Comprobar progreso del módulo
    const progModulo = await ProgresoModulo.findOne({
      where: {
        usuario_id: usuarioId,
        curso_id: cursoIdNum,
        modulo_id: moduloIdNum,
      },
    });

    if (!progModulo || progModulo.estado === "bloqueado") {
      return res
        .status(403)
        .json({ error: "Módulo bloqueado para este usuario" });
    }

    // 3) Progreso de lecciones para este módulo
    const progresoLecciones = await ProgresoLeccion.findAll({
      where: {
        usuario_id: usuarioId,
        curso_id: cursoIdNum,
        modulo_id: moduloIdNum,
      },
    });

    const progPorLeccion = new Map<number, ProgresoLeccion>();
    for (const p of progresoLecciones) {
      progPorLeccion.set(Number(p.leccion_id), p);
    }

    const json = modulo.toJSON() as any;
    const leccionesRaw: any[] = Array.isArray(json.lecciones)
      ? json.lecciones
      : [];

    const leccionesOrdenadas = leccionesRaw
      .map((l: any) => {
        const id = Number(l.id);
        const orden =
          typeof l.orden === "number"
            ? l.orden
            : l.orden != null
            ? Number(l.orden)
            : null;

        const prog = progPorLeccion.get(id);
        const estado = prog?.estado ?? "bloqueada";
        const aprobado = prog ? Boolean(prog.aprobado) : false;
        const nota = prog?.nota_ultima_prueba ?? null;

        return {
          id,
          titulo: l.titulo,
          descripcion: l.descripcion,
          orden,
          youtube_id: l.youtube_id,
          pdf_url: l.pdf_url,
          publicado: l.publicado === true,
          estado,
          aprobado,
          nota_ultima_prueba: nota,
        };
      })
      .filter((l) => l.publicado && l.estado !== "bloqueada")
      .sort((a, b) => {
        const ao = a.orden ?? 9999;
        const bo = b.orden ?? 9999;
        if (ao !== bo) return ao - bo;
        return a.id - b.id;
      });

    const respuesta = {
      id: Number(json.id),
      curso_id: Number(json.curso_id),
      titulo: json.titulo,
      descripcion: json.descripcion,
      orden: json.orden,
      video_intro_url: json.video_intro_url ?? null, 
      pdf_intro_url: json.pdf_intro_url ?? null,    
      estado: progModulo.estado, 
      lecciones: leccionesOrdenadas,
    };

    return res.json(respuesta);
  } catch (e) {
    console.error("Error al obtener módulo para alumno:", e);
    return res.status(500).json({
      error: "Error al obtener información del módulo",
    });
  }
};
