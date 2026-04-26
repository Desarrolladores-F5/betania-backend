// src/controllers/curso.controller.ts
import { Request, Response } from "express";
import { Curso } from "../models/curso.model";
import { Modulo } from "../models/modulo.model";
import { Leccion } from "../models/leccion.model";
import { ProgresoModulo } from "../models/progreso_modulo.model";
import { ProgresoLeccion } from "../models/progreso_leccion.model";
import { publicUrl } from "../utils/upload";

/* ============================================================
 *  HELPER PARA URLS PÚBLICAS
 * ============================================================ */

/**
 * Convierte cualquier portada_url guardada en BD a una URL pública válida.
 *
 * Casos que corrige:
 * - http://localhost:3001/uploads/images/archivo.png
 * - https://otro-dominio/uploads/images/archivo.png
 * - /uploads/images/archivo.png
 *
 * Resultado en producción:
 * - https://betania-backend-production-3429.up.railway.app/uploads/images/archivo.png
 */
function normalizarArchivoUrl(req: Request, valor?: string | null) {
  if (!valor) return null;

  // Si viene como URL absoluta, dejamos solo el path desde /uploads/...
  const soloPath = valor.replace(/^https?:\/\/[^/]+/, "");

  return publicUrl(req, soloPath);
}

/* ============================================================
 *  CRUD ADMIN
 * ============================================================ */

export const crearCurso = async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion, portada_url, publicado, activo } = req.body;

    const curso = await Curso.create({
      titulo,
      descripcion: descripcion ?? null,
      portada_url: portada_url ?? null,
      publicado: !!publicado,
      activo: activo ?? true,
    });

    const json = curso.toJSON() as any;

    return res.status(201).json({
      ...json,
      portada_url: normalizarArchivoUrl(req, json.portada_url),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo crear el curso" });
  }
};

export const listarCursosAdmin = async (req: Request, res: Response) => {
  try {
    const cursos = await Curso.findAll({
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "titulo",
        "descripcion",
        "portada_url",
        "publicado",
        "activo",
        "created_at",
        "updated_at",
      ],
      raw: true, // 🔥 evita problemas con toJSON y Sequelize internals
    });

    const cursosConUrl = cursos.map((curso: any) => {
      return {
        ...curso,
        portada_url: normalizarArchivoUrl(req, curso.portada_url),
      };
    });

    return res.json(cursosConUrl);
  } catch (e: any) {
    console.error("🔥 ERROR REAL cursos admin:", e);

    return res.status(500).json({
      error: "Error al listar cursos",
      detalle: e?.message,
      stack: e?.stack,
    });
  }
};

export const obtenerCursoAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findByPk(id, {
      include: [
        {
          model: Modulo,
          as: "modulos",
          include: [{ model: Leccion, as: "lecciones" }],
        },
      ],
    });

    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

    const json = curso.toJSON() as any;

    return res.json({
      ...json,
      portada_url: normalizarArchivoUrl(req, json.portada_url),
    });
  } catch (e) {
    console.error("Error al obtener curso admin:", e);
    return res.status(500).json({ error: "Error al obtener curso" });
  }
};

export const actualizarCurso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findByPk(id);

    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

    await curso.update(req.body);

    const json = curso.toJSON() as any;

    return res.json({
      ...json,
      portada_url: normalizarArchivoUrl(req, json.portada_url),
    });
  } catch (e) {
    console.error("Error al actualizar curso:", e);
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
  } catch (e) {
    console.error("Error al eliminar curso:", e);
    return res.status(500).json({ error: "Error al eliminar curso" });
  }
};

/* ============================================================
 *  HELPERS DE PROGRESO
 * ============================================================ */

/**
 * Inicializa el progreso de módulos y lecciones para un usuario
 * la primera vez que entra a un curso:
 *  - Primer módulo: disponible
 *  - Módulos siguientes: bloqueado
 *  - Primera lección del primer módulo: disponible
 *  - Resto de lecciones del primer módulo: bloqueada
 */
async function inicializarProgresoSiNecesario(
  cursoInstancia: Curso,
  usuarioId: number
): Promise<void> {
  if (!usuarioId || !cursoInstancia?.id) return;

  const cursoId = Number(cursoInstancia.id);

  const yaExiste = await ProgresoModulo.count({
    where: { usuario_id: usuarioId, curso_id: cursoId },
  });

  if (yaExiste > 0) {
    return;
  }

  const json = cursoInstancia.toJSON() as any;
  const modulosRaw: any[] = Array.isArray(json.modulos) ? json.modulos : [];

  if (modulosRaw.length === 0) {
    return;
  }

  const modulosOrdenados = modulosRaw
    .map((m) => ({
      ...m,
      id: Number(m.id),
      orden:
        typeof m.orden === "number"
          ? m.orden
          : m.orden != null
          ? Number(m.orden)
          : null,
    }))
    .sort((a, b) => {
      const ao = a.orden ?? 9999;
      const bo = b.orden ?? 9999;
      if (ao !== bo) return ao - bo;
      return a.id - b.id;
    });

  const ahora = new Date();

  for (let i = 0; i < modulosOrdenados.length; i++) {
    const m = modulosOrdenados[i];
    const estadoModulo = i === 0 ? "disponible" : "bloqueado";

    await ProgresoModulo.create({
      usuario_id: usuarioId,
      curso_id: cursoId,
      modulo_id: m.id,
      estado: estadoModulo as "disponible" | "bloqueado" | "completado",
      fecha_desbloqueo: estadoModulo === "disponible" ? ahora : null,
      fecha_completado: null,
    });
  }

  const primerModulo = modulosOrdenados[0];
  const leccionesRaw: any[] = Array.isArray(primerModulo.lecciones)
    ? primerModulo.lecciones
    : [];

  if (leccionesRaw.length === 0) {
    return;
  }

  const leccionesOrdenadas = leccionesRaw
    .map((l) => ({
      ...l,
      id: Number(l.id),
      orden:
        typeof l.orden === "number"
          ? l.orden
          : l.orden != null
          ? Number(l.orden)
          : null,
    }))
    .sort((a, b) => {
      const ao = a.orden ?? 9999;
      const bo = b.orden ?? 9999;
      if (ao !== bo) return ao - bo;
      return a.id - b.id;
    });

  for (let i = 0; i < leccionesOrdenadas.length; i++) {
    const l = leccionesOrdenadas[i];
    const estadoLeccion = i === 0 ? "disponible" : "bloqueada";

    await ProgresoLeccion.create({
      usuario_id: usuarioId,
      curso_id: cursoId,
      modulo_id: primerModulo.id,
      leccion_id: l.id,
      estado: estadoLeccion as "bloqueada" | "disponible" | "completada",
      aprobado: false,
      nota_ultima_prueba: null,
      fecha_completado: null,
    });
  }
}

/* ============================================================
 *  ENDPOINTS PARA ALUMNO
 * ============================================================ */

/**
 * Listado de cursos visibles para el alumno.
 */
export const listarCursosPublico = async (req: Request, res: Response) => {
  try {
    const cursos = await Curso.findAll({
      order: [["id", "DESC"]],
      attributes: ["id", "titulo", "descripcion", "portada_url"],
    });

    const cursosConUrl = cursos.map((curso) => {
      const json = curso.toJSON() as any;

      return {
        ...json,
        portada_url: normalizarArchivoUrl(req, json.portada_url),
      };
    });

    return res.json(cursosConUrl);
  } catch (e) {
    console.error("Error al listar cursos públicos:", e);
    return res
      .status(500)
      .json({ error: "Error al listar cursos publicados" });
  }
};

/**
 * Detalle del curso para el alumno:
 *  - Inicializa progreso de módulos y lecciones (si es la primera vez).
 *  - Devuelve SOLO módulos con su estado (bloqueado / disponible / completado).
 *  - NO devuelve aún las lecciones.
 */
export const obtenerCursoConContenido = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const usuarioId = Number(user.id);

    const curso = await Curso.findOne({
      where: { id },
      attributes: ["id", "titulo", "descripcion", "portada_url"],
      include: [
        {
          model: Modulo,
          as: "modulos",
          attributes: ["id", "titulo", "descripcion", "orden"],
          include: [
            {
              model: Leccion,
              as: "lecciones",
              attributes: [
                "id",
                "titulo",
                "descripcion",
                "orden",
                "publicado",
              ],
            },
          ],
        },
      ],
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso no disponible" });
    }

    await inicializarProgresoSiNecesario(curso, usuarioId);

    const progresoModulos = await ProgresoModulo.findAll({
      where: { usuario_id: usuarioId, curso_id: Number(curso.id) },
    });

    const json = curso.toJSON() as any;

    const modulosRaw: any[] = Array.isArray(json.modulos) ? json.modulos : [];

    const modulosOrdenados = modulosRaw
      .map((m) => ({
        ...m,
        id: Number(m.id),
        orden:
          typeof m.orden === "number"
            ? m.orden
            : m.orden != null
            ? Number(m.orden)
            : null,
      }))
      .sort((a, b) => {
        const ao = a.orden ?? 9999;
        const bo = b.orden ?? 9999;
        if (ao !== bo) return ao - bo;
        return a.id - b.id;
      })
      .map((m) => {
        const prog = progresoModulos.find(
          (p) => Number(p.modulo_id) === Number(m.id)
        );

        return {
          id: m.id,
          titulo: m.titulo,
          descripcion: m.descripcion,
          orden: m.orden,
          estado: prog?.estado ?? "bloqueado",
        };
      });

    const respuesta = {
      id: Number(json.id),
      titulo: json.titulo,
      descripcion: json.descripcion,
      portada_url: normalizarArchivoUrl(req, json.portada_url),
      modulos: modulosOrdenados,
    };

    return res.json(respuesta);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Error al obtener contenido del curso" });
  }
};