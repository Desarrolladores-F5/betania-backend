// src/controllers/user.estadisticas.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { ProgresoModulo } from "../models/progreso_modulo.model";
import { ProgresoLeccion } from "../models/progreso_leccion.model";

/**
 * GET /user/estadisticas
 * Resumen para el dashboard del alumno:
 * - cursos_activos
 * - lecciones_pendientes
 * - progreso_global (%)
 */
export const obtenerEstadisticasUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    // El middleware requireAuth ya debería setear req.user
    const userId = (req as any).user?.id as number | undefined;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // 1) Cursos activos: cursos donde el usuario tiene módulos disponibles o completados
    const cursosActivos = await ProgresoModulo.count({
      where: {
        usuario_id: userId,
        estado: {
          [Op.in]: ["disponible", "completado"],
        },
      },
      distinct: true,
      col: "curso_id",
    });

    // 2) Total de lecciones que existen para este usuario (según progreso)
    const totalLecciones = await ProgresoLeccion.count({
      where: { usuario_id: userId },
    });

    // 3) Lecciones completadas
    const leccionesCompletadas = await ProgresoLeccion.count({
      where: {
        usuario_id: userId,
        estado: "completada",
      },
    });

    // 4) Lecciones pendientes = total - completadas (no negativo)
    const leccionesPendientes =
      totalLecciones > leccionesCompletadas
        ? totalLecciones - leccionesCompletadas
        : 0;

    // 5) Progreso global (%) = completadas / total * 100
    const progresoGlobal =
      totalLecciones > 0
        ? Math.round((leccionesCompletadas / totalLecciones) * 100)
        : 0;

    return res.json({
      data: {
        cursos_activos: cursosActivos,
        lecciones_pendientes: leccionesPendientes,
        progreso_global: progresoGlobal,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas de usuario:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener estadísticas del usuario" });
  }
};
