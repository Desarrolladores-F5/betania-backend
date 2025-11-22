// src/controllers/modulo.controller.ts
import { Request, Response } from "express";
import { Modulo } from "../models/modulo.model";
import { Curso } from "../models/curso.model";

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

    // curso_id: validación robusta (acepta string o number)
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

    // Normalización de video_intro_url (solo URL escrita)
    const finalVideoIntroUrl =
      typeof video_intro_url === "string" && video_intro_url.trim().length > 0
        ? video_intro_url.trim()
        : null;

    // Normalización de pdf_intro_url:
    // - si viene archivo (req.file) desde uploadPdf.single("pdf_intro") → usamos ese
    // - si NO viene archivo, usamos el valor enviado en el body (si existe)
    let finalPdfIntroUrl: string | null = null;

    if (req.file) {
      // uploadPdf lo guarda en uploads/pdfs
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

    // curso_id (opcional)
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

    // titulo (opcional)
    if (titulo !== undefined) {
      if (typeof titulo !== "string" || !titulo.trim()) {
        return res.status(400).json({ error: "titulo inválido" });
      }
      payload.titulo = titulo.trim();
    }

    // descripcion (opcional)
    if (descripcion !== undefined) {
      payload.descripcion =
        typeof descripcion === "string" ? descripcion : null;
    }

    // orden (opcional)
    if (orden !== undefined) {
      const parsedOrden = Number(orden);
      if (!Number.isFinite(parsedOrden)) {
        return res.status(400).json({ error: "orden debe ser number" });
      }
      payload.orden = parsedOrden;
    }

    // activo (opcional)
    if (activo !== undefined) {
      if (typeof activo !== "boolean") {
        return res.status(400).json({ error: "activo debe ser boolean" });
      }
      payload.activo = activo;
    }

    // video_intro_url (opcional, solo texto)
    if (video_intro_url !== undefined) {
      payload.video_intro_url =
        typeof video_intro_url === "string" &&
        video_intro_url.trim().length > 0
          ? video_intro_url.trim()
          : null;
    }

    // pdf_intro_url:
    // - si viene archivo, PRIORIDAD al archivo
    // - si no hay archivo pero viene pdf_intro_url en body, normalizamos string/null
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
