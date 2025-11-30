"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.descargarPDFResultado = exports.listarIntentosUsuario = exports.finalizarIntento = exports.registrarRespuestas = exports.crearIntento = void 0;
const sequelize_1 = require("sequelize");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const examen_model_1 = require("../models/examen.model");
const pregunta_model_1 = require("../models/pregunta.model");
const alternativa_model_1 = require("../models/alternativa.model");
const intento_examen_model_1 = require("../models/intento_examen.model");
const respuesta_intento_model_1 = require("../models/respuesta_intento.model");
const usuario_model_1 = require("../models/usuario.model");
// Umbral de aprobación del MVP: 60% del puntaje total
const APROBACION_PORCENTAJE = 0.6;
// -----------------------------------------------------------------------------
// POST /examenes/:id/intentos
// -----------------------------------------------------------------------------
const crearIntento = async (req, res) => {
    try {
        const { id } = req.params; // examen_id
        const usuario = req.user;
        const examen = await examen_model_1.Examen.findByPk(id);
        if (!examen || !examen.publicado) {
            return res.status(404).json({ error: "Examen no disponible" });
        }
        // Validar tope de intentos si aplica
        if (examen.intento_max && examen.intento_max > 0) {
            const count = await intento_examen_model_1.IntentoExamen.count({
                where: { examen_id: examen.id, usuario_id: usuario.id },
            });
            if (count >= examen.intento_max) {
                return res
                    .status(403)
                    .json({ error: "Límite de intentos alcanzado" });
            }
        }
        const intento = await intento_examen_model_1.IntentoExamen.create({
            examen_id: examen.id,
            usuario_id: usuario.id,
            fecha_inicio: new Date(),
            puntaje_total: null,
            aprobado: null,
            duracion_seg: null,
            fecha_fin: null,
        });
        return res.status(201).json(intento);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudo crear el intento" });
    }
};
exports.crearIntento = crearIntento;
// -----------------------------------------------------------------------------
// POST /intentos/:id/respuestas
// body: [{ pregunta_id, alternativa_id }]
// -----------------------------------------------------------------------------
const registrarRespuestas = async (req, res) => {
    try {
        const { id } = req.params; // intento_id
        const usuario = req.user;
        const intento = await intento_examen_model_1.IntentoExamen.findByPk(id);
        if (!intento || intento.usuario_id !== usuario.id) {
            return res.status(404).json({ error: "Intento no encontrado" });
        }
        if (intento.fecha_fin) {
            return res
                .status(400)
                .json({ error: "El intento ya fue finalizado" });
        }
        const payload = req.body;
        if (!Array.isArray(payload) || payload.length === 0) {
            return res
                .status(400)
                .json({ error: "Respuestas requeridas" });
        }
        // Eliminar respuestas previas de esas preguntas (permite reenviar)
        const preguntaIds = payload.map((r) => r.pregunta_id);
        await respuesta_intento_model_1.RespuestaIntento.destroy({
            where: {
                intento_id: intento.id,
                pregunta_id: { [sequelize_1.Op.in]: preguntaIds },
            },
        });
        // Registrar nuevas
        const registros = await respuesta_intento_model_1.RespuestaIntento.bulkCreate(payload.map((r) => ({
            intento_id: intento.id,
            pregunta_id: r.pregunta_id,
            alternativa_id: r.alternativa_id,
            correcta: false,
            puntaje_obtenido: 0,
        })));
        return res.status(201).json({ ok: true, count: registros.length });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "No se pudieron registrar respuestas" });
    }
};
exports.registrarRespuestas = registrarRespuestas;
// -----------------------------------------------------------------------------
// POST /intentos/:id/finalizar
// -----------------------------------------------------------------------------
const finalizarIntento = async (req, res) => {
    try {
        const { id } = req.params; // intento_id
        const usuario = req.user;
        const intento = await intento_examen_model_1.IntentoExamen.findByPk(id);
        if (!intento || intento.usuario_id !== usuario.id) {
            return res.status(404).json({ error: "Intento no encontrado" });
        }
        if (intento.fecha_fin) {
            return res
                .status(400)
                .json({ error: "El intento ya fue finalizado" });
        }
        // Obtener estructura completa del examen
        const examen = await examen_model_1.Examen.findByPk(intento.examen_id, {
            include: [
                {
                    model: pregunta_model_1.Pregunta,
                    as: "preguntas",
                    include: [{ model: alternativa_model_1.Alternativa, as: "alternativas" }],
                },
            ],
        });
        if (!examen) {
            return res.status(404).json({ error: "Examen no disponible" });
        }
        const respuestas = await respuesta_intento_model_1.RespuestaIntento.findAll({
            where: { intento_id: intento.id },
        });
        // Mapas de corrección
        let puntajeTotalPosible = 0;
        const mapaCorrectas = new Map(); // pregunta_id -> alternativa_id_correcta
        const mapaPuntaje = new Map(); // pregunta_id -> puntaje
        for (const p of examen.preguntas) {
            puntajeTotalPosible += Number(p.puntaje);
            mapaPuntaje.set(p.id, Number(p.puntaje));
            const altCorrecta = p.alternativas.find((a) => a.es_correcta);
            if (altCorrecta) {
                mapaCorrectas.set(p.id, altCorrecta.id);
            }
        }
        // Calificar
        let puntajeObtenido = 0;
        for (const r of respuestas) {
            const correctaId = mapaCorrectas.get(r.pregunta_id);
            const esCorrecta = correctaId === r.alternativa_id;
            const puntos = esCorrecta
                ? mapaPuntaje.get(r.pregunta_id) || 0
                : 0;
            r.correcta = esCorrecta;
            r.puntaje_obtenido = puntos;
            puntajeObtenido += Number(puntos);
            await r.save();
        }
        const fin = new Date();
        const duracion = Math.max(0, Math.round((fin.getTime() -
            new Date(intento.fecha_inicio).getTime()) /
            1000));
        const aprobado = puntajeTotalPosible > 0
            ? puntajeObtenido / puntajeTotalPosible >=
                APROBACION_PORCENTAJE
            : false;
        intento.puntaje_total = Number(puntajeObtenido.toFixed(2));
        intento.aprobado = aprobado;
        intento.duracion_seg = duracion;
        intento.fecha_fin = fin;
        await intento.save();
        return res.json({
            intento_id: intento.id,
            puntaje_total: intento.puntaje_total,
            puntaje_posible: Number(puntajeTotalPosible.toFixed(2)),
            porcentaje: puntajeTotalPosible > 0
                ? Number(((puntajeObtenido / puntajeTotalPosible) * 100).toFixed(2))
                : 0,
            aprobado,
            duracion_seg: duracion,
        });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "No se pudo finalizar el intento" });
    }
};
exports.finalizarIntento = finalizarIntento;
// -----------------------------------------------------------------------------
// GET /intentos (usuario): ?examen_id=...
// -----------------------------------------------------------------------------
const listarIntentosUsuario = async (req, res) => {
    try {
        const usuario = req.user;
        const { examen_id } = req.query;
        const where = { usuario_id: usuario.id };
        if (examen_id) {
            where.examen_id = Number(examen_id);
        }
        const intentos = await intento_examen_model_1.IntentoExamen.findAll({
            where,
            order: [["id", "DESC"]],
        });
        return res.json(intentos);
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "No se pudieron listar intentos" });
    }
};
exports.listarIntentosUsuario = listarIntentosUsuario;
// -----------------------------------------------------------------------------
// GET /intentos/:id/pdf — Genera PDF del resultado
// -----------------------------------------------------------------------------
const descargarPDFResultado = async (req, res) => {
    try {
        const { id } = req.params; // intento_id
        const usuario = req.user;
        const intento = await intento_examen_model_1.IntentoExamen.findByPk(id);
        if (!intento || intento.usuario_id !== usuario.id) {
            return res.status(404).json({ error: "Intento no encontrado" });
        }
        if (!intento.fecha_fin) {
            return res
                .status(400)
                .json({ error: "El intento aún no está finalizado" });
        }
        const examen = await examen_model_1.Examen.findByPk(intento.examen_id);
        const user = await usuario_model_1.Usuario.findByPk(usuario.id);
        const filename = `resultado_intento_${intento.id}.pdf`;
        const fullpath = path_1.default.join(process.cwd(), "uploads/resultados", filename);
        const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
        const stream = fs_1.default.createWriteStream(fullpath);
        doc.pipe(stream);
        // Encabezado
        doc
            .fontSize(18)
            .text("Resultado de Examen - Betania", { align: "center" })
            .moveDown();
        const nombreUsuario = user
            ? `${user.nombres ?? ""} ${user.apellido_paterno ?? ""} ${user.apellido_materno ?? ""}`.trim()
            : "";
        doc
            .fontSize(12)
            .text(`Usuario: ${nombreUsuario} (id: ${usuario.id})`);
        doc.text(`Examen: ${examen?.titulo} (id: ${examen?.id})`);
        doc.text(`Intento id: ${intento.id}`);
        doc.text(`Fecha inicio: ${new Date(intento.fecha_inicio).toLocaleString()}`);
        doc.text(`Fecha fin: ${new Date(intento.fecha_fin).toLocaleString()}`);
        doc
            .text(`Duración (seg): ${intento.duracion_seg ?? 0}`)
            .moveDown();
        doc.text(`Puntaje total: ${intento.puntaje_total ?? 0}`);
        doc
            .text(`Aprobado: ${intento.aprobado ? "Sí" : "No"}`)
            .moveDown();
        doc.text("Este documento sirve como constancia del resultado del intento de examen.", { align: "left" });
        doc.end();
        stream.on("finish", () => {
            res
                .status(200)
                .json({ url: `/uploads/resultados/${filename}` });
        });
        stream.on("error", (err) => {
            console.error(err);
            res
                .status(500)
                .json({ error: "No se pudo generar el PDF" });
        });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "Error al generar PDF" });
    }
};
exports.descargarPDFResultado = descargarPDFResultado;
