// src/controllers/admin.reportes.controller.ts
import { Request, Response } from "express";
import { Op, WhereOptions, col, fn, literal } from "sequelize";

import { IntentoExamen } from "../models/intento_examen.model";
import { Usuario } from "../models/usuario.model";
import { Examen } from "../models/examen.model";
import { Curso } from "../models/curso.model";
import { Pregunta } from "../models/pregunta.model";
import { ProgresoModulo } from "../models/progreso_modulo.model";
import { Modulo } from "../models/modulo.model";

/* =============================================================================
 * INTENTOS DE EXÁMENES (ADMIN)
 * GET /api/admin/intentos
 * =============================================================================
 */
export const listarIntentosAdmin = async (req: Request, res: Response) => {
  try {
    const { examen_id, curso_id, usuario_id, page = "1", pageSize = "20" } =
      req.query;

    const where: WhereOptions = {};
    if (examen_id) (where as any).examen_id = Number(examen_id);
    if (usuario_id) (where as any).usuario_id = Number(usuario_id);

    // Resolver examen por curso (MVP: 1 examen por curso)
    if (curso_id && !examen_id) {
      const ex = await Examen.findOne({
        where: { curso_id: Number(curso_id) },
      });
      if (!ex) {
        return res.json({
          total: 0,
          page: 1,
          pageSize: Number(pageSize),
          rows: [],
        });
      }
      (where as any).examen_id = ex.id;
    }

    const p = Math.max(1, Number(page));
    const ps = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (p - 1) * ps;

    const { rows, count } = await IntentoExamen.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "email",
            "rol_id",
          ],
        },
        {
          model: Examen,
          as: "examen",
          attributes: ["id", "titulo"],
          include: [
            { model: Curso, as: "curso", attributes: ["id", "titulo"] },
          ],
        },
      ],
      order: [["id", "DESC"]],
      limit: ps,
      offset,
    });

    return res.json({ total: count, page: p, pageSize: ps, rows });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "No se pudieron listar los intentos" });
  }
};

/* =============================================================================
 * AGREGADOS POR EXAMEN
 * GET /api/admin/reportes/examenes
 * =============================================================================
 */
export const agregadosExamen = async (req: Request, res: Response) => {
  try {
    const { examen_id, curso_id } = req.query;

    let examenId: number | null = null;

    if (examen_id) {
      examenId = Number(examen_id);
    } else if (curso_id) {
      const ex = await Examen.findOne({
        where: { curso_id: Number(curso_id) },
      });
      if (!ex) {
        return res
          .status(404)
          .json({ error: "No existe examen para el curso" });
      }
      examenId = ex.id;
    } else {
      return res
        .status(400)
        .json({ error: "Debe indicar examen_id o curso_id" });
    }

    const totalPuntajeRow = (await Pregunta.findOne({
      where: { examen_id: examenId },
      attributes: [
        [fn("COALESCE", fn("SUM", col("puntaje")), literal("0")), "puntaje_posible"],
      ],
      raw: true,
    })) as unknown as { puntaje_posible: number | string | null };

    const puntajePosible = Number(totalPuntajeRow?.puntaje_posible ?? 0);

    const totalIntentos = await IntentoExamen.count({
      where: { examen_id: examenId },
    });
    const totalAprobados = await IntentoExamen.count({
      where: { examen_id: examenId, aprobado: true },
    });

    const avgRow = (await IntentoExamen.findOne({
      where: { examen_id: examenId },
      attributes: [[fn("AVG", col("puntaje_total")), "promedio_puntaje"]],
      raw: true,
    })) as unknown as { promedio_puntaje: number | string | null };

    const promedioPuntaje = Number(avgRow?.promedio_puntaje ?? 0);

    const tasaAprobacion =
      totalIntentos > 0
        ? Number((totalAprobados / totalIntentos).toFixed(4))
        : 0;

    const promedioPorcentaje =
      puntajePosible > 0
        ? Number(((promedioPuntaje / puntajePosible) * 100).toFixed(2))
        : 0;

    const ultimos = await IntentoExamen.findAll({
      where: { examen_id: examenId },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: [
            "id",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "email",
          ],
        },
      ],
      order: [["id", "DESC"]],
      limit: 10,
    });

    return res.json({
      examen_id: examenId,
      puntaje_posible: puntajePosible,
      total_intentos: totalIntentos,
      total_aprobados: totalAprobados,
      tasa_aprobacion: tasaAprobacion,
      promedio_puntaje: Number(promedioPuntaje.toFixed(2)),
      promedio_porcentaje: promedioPorcentaje,
      ultimos_intentos: ultimos,
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "No se pudieron obtener los agregados" });
  }
};

/* =============================================================================
 * RESUMEN DE APROBACIONES
 * GET /api/admin/reportes/resumen
 * =============================================================================
 */
export const resumenAprobacionesAdmin = async (_req: Request, res: Response) => {
  try {
    const modulosAprobados = await ProgresoModulo.count({
      where: { estado: "completado" },
    });

    const modulosEnProgreso = await ProgresoModulo.count({
      where: { estado: "disponible" },
    });

    const totales = (await Modulo.findAll({
      attributes: ["curso_id", [fn("COUNT", col("id")), "total"]],
      group: ["curso_id"],
      raw: true,
    })) as unknown as { curso_id: number; total: number | string }[];

    const totalByCurso = new Map<number, number>();
    totales.forEach((r) =>
      totalByCurso.set(Number(r.curso_id), Number(r.total))
    );

    const completados = (await ProgresoModulo.findAll({
      attributes: [
        "usuario_id",
        "curso_id",
        [fn("COUNT", col("id")), "completados"],
      ],
      where: { estado: "completado" },
      group: ["usuario_id", "curso_id"],
      raw: true,
    })) as unknown as {
      usuario_id: number;
      curso_id: number;
      completados: number | string;
    }[];

    let cursosAprobados = 0;
    completados.forEach((r) => {
      const total = totalByCurso.get(Number(r.curso_id)) ?? 0;
      if (total > 0 && Number(r.completados) >= total) cursosAprobados++;
    });

    return res.json({
      ok: true,
      data: {
        modulos_aprobados: modulosAprobados,
        cursos_aprobados: cursosAprobados,
        modulos_en_progreso: modulosEnProgreso,
        cursos_en_progreso: Math.max(0, completados.length - cursosAprobados),
        total_aprobaciones_modulo: modulosAprobados,
        total_aprobaciones_curso: cursosAprobados,
      },
    });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ ok: false, error: "No se pudo obtener el resumen" });
  }
};

/* =============================================================================
 * LISTADO DE APROBACIONES
 * GET /api/admin/reportes/aprobaciones
 * =============================================================================
 */
export const aprobacionesAdmin = async (req: Request, res: Response) => {
  try {
    const { tipo = "modulo" } = req.query;

    // -----------------------------
    // APROBACIONES POR MÓDULO
    // -----------------------------
    if (tipo === "modulo") {
      const rows = await ProgresoModulo.findAll({
        where: { estado: "completado" },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: [
              "id",
              "nombres",
              "apellido_paterno",
              "apellido_materno",
              "email",
            ],
          },
          { model: Curso, as: "curso", attributes: ["id", "titulo"] },
          { model: Modulo, as: "modulo", attributes: ["id", "titulo"] },
        ],
        order: [["fecha_completado", "DESC"]],
      });

      const data = rows.map((r: any) => ({
        id: r.id,
        alumno_nombre: r.usuario
          ? `${r.usuario.nombres ?? ""} ${r.usuario.apellido_paterno ?? ""} ${r.usuario.apellido_materno ?? ""}`.trim()
          : null,
        curso_titulo: r.curso?.titulo ?? null,
        modulo_titulo: r.modulo?.titulo ?? null,
        estado: r.estado,
        nota_final: null,
        fecha_aprobacion: r.fecha_completado
          ? new Date(r.fecha_completado).toISOString()
          : null,
      }));

      return res.json({ ok: true, data });
    }

    // -----------------------------
    // APROBACIONES POR CURSO
    // -----------------------------
    const completados = (await ProgresoModulo.findAll({
      attributes: [
        "usuario_id",
        "curso_id",
        [fn("COUNT", col("id")), "completados"],
        [fn("MAX", col("fecha_completado")), "fecha"],
      ],
      where: { estado: "completado" },
      group: ["usuario_id", "curso_id"],
      raw: true,
    })) as unknown as {
      usuario_id: number;
      curso_id: number;
      completados: number | string;
      fecha: Date | string;
    }[];

    const cursos = await Curso.findAll({ raw: true });
    const usuarios = await Usuario.findAll({ raw: true });

    const cursoById = new Map(cursos.map((c: any) => [c.id, c]));
    const usuarioById = new Map(usuarios.map((u: any) => [u.id, u]));

    const totales = (await Modulo.findAll({
      attributes: ["curso_id", [fn("COUNT", col("id")), "total"]],
      group: ["curso_id"],
      raw: true,
    })) as unknown as { curso_id: number; total: number | string }[];

    const totalByCurso = new Map<number, number>();
    totales.forEach((r) =>
      totalByCurso.set(Number(r.curso_id), Number(r.total))
    );

    const data = completados
      .filter(
        (r) => Number(r.completados) >= (totalByCurso.get(Number(r.curso_id)) ?? 0)
      )
      .map((r, idx) => {
        const u = usuarioById.get(r.usuario_id);
        const c = cursoById.get(r.curso_id);
        return {
          id: idx + 1,
          alumno_nombre: u
            ? `${u.nombres ?? ""} ${u.apellido_paterno ?? ""} ${u.apellido_materno ?? ""}`.trim()
            : null,
          curso_titulo: c?.titulo ?? null,
          modulo_titulo: null,
          estado: "aprobado",
          nota_final: null,
          fecha_aprobacion: r.fecha
            ? new Date(r.fecha).toISOString()
            : null,
        };
      });

    return res.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ ok: false, error: "No se pudieron listar aprobaciones" });
  }
};
