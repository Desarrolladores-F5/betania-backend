"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agregadosExamen = exports.listarIntentosAdmin = void 0;
const sequelize_1 = require("sequelize");
const intento_examen_model_1 = require("../models/intento_examen.model");
const usuario_model_1 = require("../models/usuario.model");
const examen_model_1 = require("../models/examen.model");
const curso_model_1 = require("../models/curso.model");
const pregunta_model_1 = require("../models/pregunta.model");
// GET /api/admin/intentos?examen_id=...&curso_id=...&usuario_id=...&page=1&pageSize=20
const listarIntentosAdmin = async (req, res) => {
    try {
        const { examen_id, curso_id, usuario_id, page = "1", pageSize = "20" } = req.query;
        const where = {};
        if (examen_id)
            where.examen_id = Number(examen_id);
        if (usuario_id)
            where.usuario_id = Number(usuario_id);
        // Si llega curso_id, resolver examen_id (en MVP hay 1 examen por curso)
        if (curso_id && !examen_id) {
            const ex = await examen_model_1.Examen.findOne({ where: { curso_id: Number(curso_id) } });
            if (!ex)
                return res.json({ total: 0, page: 1, pageSize: Number(pageSize), rows: [] });
            where.examen_id = ex.id;
        }
        const p = Math.max(1, Number(page));
        const ps = Math.min(100, Math.max(1, Number(pageSize)));
        const offset = (p - 1) * ps;
        const { rows, count } = await intento_examen_model_1.IntentoExamen.findAndCountAll({
            where,
            include: [
                { model: usuario_model_1.Usuario, as: "usuario", attributes: ["id", "nombre", "apellido", "email", "rol_id"] },
                { model: examen_model_1.Examen, as: "examen", attributes: ["id", "titulo"],
                    include: [{ model: curso_model_1.Curso, as: "curso", attributes: ["id", "titulo"] }] }
            ],
            order: [["id", "DESC"]],
            limit: ps,
            offset
        });
        return res.json({ total: count, page: p, pageSize: ps, rows });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudieron listar los intentos" });
    }
};
exports.listarIntentosAdmin = listarIntentosAdmin;
// GET /api/admin/reportes/examenes?examen_id=... | ?curso_id=...
const agregadosExamen = async (req, res) => {
    try {
        const { examen_id, curso_id } = req.query;
        // Resolver examen_id si sólo viene curso_id (MVP: un examen por curso)
        let examenId = null;
        if (examen_id) {
            examenId = Number(examen_id);
        }
        else if (curso_id) {
            const ex = await examen_model_1.Examen.findOne({ where: { curso_id: Number(curso_id) } });
            if (!ex)
                return res.status(404).json({ error: "No existe examen para el curso" });
            examenId = ex.id;
        }
        else {
            return res.status(400).json({ error: "Debe indicar examen_id o curso_id" });
        }
        // Puntaje posible (suma de puntajes de preguntas)
        const totalPuntajeRow = await pregunta_model_1.Pregunta.findOne({
            where: { examen_id: examenId },
            attributes: [[(0, sequelize_1.fn)("COALESCE", (0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("puntaje")), (0, sequelize_1.literal)("0")), "puntaje_posible"]],
            raw: true
        });
        const puntajePosible = Number(totalPuntajeRow?.puntaje_posible ?? 0);
        // totales
        const totalIntentos = await intento_examen_model_1.IntentoExamen.count({ where: { examen_id: examenId } });
        const totalAprobados = await intento_examen_model_1.IntentoExamen.count({ where: { examen_id: examenId, aprobado: true } });
        // promedio de puntaje total
        const avgRow = await intento_examen_model_1.IntentoExamen.findOne({
            where: { examen_id: examenId },
            attributes: [[(0, sequelize_1.fn)("AVG", (0, sequelize_1.col)("puntaje_total")), "promedio_puntaje"]],
            raw: true
        });
        const promedioPuntaje = Number(avgRow?.promedio_puntaje ?? 0);
        const tasaAprobacion = totalIntentos > 0 ? Number((totalAprobados / totalIntentos).toFixed(4)) : 0;
        const promedioPorcentaje = puntajePosible > 0
            ? Number(((promedioPuntaje / puntajePosible) * 100).toFixed(2))
            : 0;
        // Top 10 últimos intentos (para referencia rápida)
        const ultimos = await intento_examen_model_1.IntentoExamen.findAll({
            where: { examen_id: examenId },
            include: [{ model: usuario_model_1.Usuario, as: "usuario", attributes: ["id", "nombre", "apellido", "email"] }],
            order: [["id", "DESC"]],
            limit: 10
        });
        return res.json({
            examen_id: examenId,
            puntaje_posible: puntajePosible,
            total_intentos: totalIntentos,
            total_aprobados: totalAprobados,
            tasa_aprobacion: tasaAprobacion, // 0..1
            promedio_puntaje: Number(promedioPuntaje.toFixed(2)),
            promedio_porcentaje: promedioPorcentaje, // 0..100
            ultimos_intentos: ultimos
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudieron obtener los agregados" });
    }
};
exports.agregadosExamen = agregadosExamen;
