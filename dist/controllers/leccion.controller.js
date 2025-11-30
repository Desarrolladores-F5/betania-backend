"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerLeccionPublica = exports.eliminarLeccion = exports.actualizarLeccion = exports.crearLeccion = exports.listarLeccionesPorModulo = exports.obtenerLeccionAdmin = exports.listarLecciones = void 0;
const leccion_model_1 = require("../models/leccion.model");
const modulo_model_1 = require("../models/modulo.model");
const progreso_leccion_model_1 = require("../models/progreso_leccion.model");
/* =========================
 *  ADMIN – LISTAR (opcionalmente por módulo)
 *  GET /api/admin/lecciones?modulo_id=4
 * ========================= */
const listarLecciones = async (req, res) => {
    try {
        const { modulo_id } = req.query;
        const where = {};
        if (modulo_id != null)
            where.modulo_id = Number(modulo_id);
        const lecciones = await leccion_model_1.Leccion.findAll({
            where,
            order: [
                ["orden", "ASC"],
                ["id", "ASC"],
            ],
        });
        return res.json(lecciones);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al listar lecciones" });
    }
};
exports.listarLecciones = listarLecciones;
/* =========================
 *  ADMIN – OBTENER POR ID
 *  GET /api/admin/lecciones/:id
 * ========================= */
const obtenerLeccionAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const leccion = await leccion_model_1.Leccion.findByPk(id);
        if (!leccion)
            return res.status(404).json({ error: "Lección no encontrada" });
        return res.json(leccion);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al obtener la lección" });
    }
};
exports.obtenerLeccionAdmin = obtenerLeccionAdmin;
/* =========================
 *  ADMIN – LISTAR POR MÓDULO
 *  GET /api/admin/modulos/:moduloId/lecciones
 * ========================= */
const listarLeccionesPorModulo = async (req, res) => {
    try {
        const moduloId = Number(req.params.moduloId);
        const modulo = await modulo_model_1.Modulo.findByPk(moduloId);
        if (!modulo)
            return res.status(404).json({ error: "Módulo no encontrado" });
        const lecciones = await leccion_model_1.Leccion.findAll({
            where: { modulo_id: moduloId },
            order: [
                ["orden", "ASC"],
                ["id", "ASC"],
            ],
        });
        return res.json({ modulo, lecciones });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "Error al listar lecciones del módulo" });
    }
};
exports.listarLeccionesPorModulo = listarLeccionesPorModulo;
/* =========================
 *  ADMIN – CREAR
 * ========================= */
const crearLeccion = async (req, res) => {
    try {
        const { modulo_id, examen_id, // opcional
        titulo, descripcion, 
        // 👇 NUEVOS CAMPOS: PDF de contenido principal
        contenido_pdf_url, contenido_pdf_titulo, 
        // video principal
        youtube_id, youtube_titulo, 
        // video adicional
        youtube_id_extra, youtube_titulo_extra, 
        // PDF de apoyo
        pdf_url, pdf_titulo, orden, publicado, } = req.body;
        const modulo = await modulo_model_1.Modulo.findByPk(modulo_id);
        if (!modulo)
            return res.status(400).json({ error: "modulo_id inválido" });
        const leccion = await leccion_model_1.Leccion.create({
            modulo_id,
            examen_id: examen_id ?? null,
            titulo,
            descripcion: descripcion ?? null,
            // PDF de contenido principal
            contenido_pdf_url: contenido_pdf_url ?? null,
            contenido_pdf_titulo: contenido_pdf_titulo ?? null,
            // video principal
            youtube_id: youtube_id ?? null,
            youtube_titulo: youtube_titulo ?? null,
            // video adicional
            youtube_id_extra: youtube_id_extra ?? null,
            youtube_titulo_extra: youtube_titulo_extra ?? null,
            // PDF de apoyo
            pdf_url: pdf_url ?? null,
            pdf_titulo: pdf_titulo ?? null,
            orden: orden ?? 1,
            publicado: !!publicado,
        });
        return res.status(201).json(leccion);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudo crear la lección" });
    }
};
exports.crearLeccion = crearLeccion;
/* =========================
 *  ADMIN – ACTUALIZAR
 * ========================= */
const actualizarLeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const leccion = await leccion_model_1.Leccion.findByPk(id);
        if (!leccion)
            return res.status(404).json({ error: "Lección no encontrada" });
        await leccion.update({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion ?? null,
            // PDF de contenido principal
            contenido_pdf_url: req.body.contenido_pdf_url ?? null,
            contenido_pdf_titulo: req.body.contenido_pdf_titulo ?? null,
            // video principal
            youtube_id: req.body.youtube_id ?? null,
            youtube_titulo: req.body.youtube_titulo ?? null,
            // video adicional
            youtube_id_extra: req.body.youtube_id_extra ?? null,
            youtube_titulo_extra: req.body.youtube_titulo_extra ?? null,
            // PDF de apoyo
            pdf_url: req.body.pdf_url ?? null,
            pdf_titulo: req.body.pdf_titulo ?? null,
            orden: req.body.orden ?? leccion.orden,
            publicado: req.body.publicado !== undefined
                ? req.body.publicado
                : leccion.publicado,
            // vinculación con examen
            examen_id: req.body.examen_id !== undefined
                ? req.body.examen_id
                : leccion.examen_id,
        });
        return res.json(leccion);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al actualizar lección" });
    }
};
exports.actualizarLeccion = actualizarLeccion;
/* =========================
 *  ADMIN – ELIMINAR
 * ========================= */
const eliminarLeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const leccion = await leccion_model_1.Leccion.findByPk(id);
        if (!leccion)
            return res.status(404).json({ error: "Lección no encontrada" });
        await leccion.destroy();
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al eliminar lección" });
    }
};
exports.eliminarLeccion = eliminarLeccion;
/* =========================
 *  USUARIO – LECCIÓN + PROGRESO
 *  GET /api/cursos/leccion/:id
 * ========================= */
const obtenerLeccionPublica = async (req, res) => {
    try {
        const { id } = req.params;
        const leccion = await leccion_model_1.Leccion.findByPk(id);
        if (!leccion || leccion.publicado !== true) {
            return res.status(404).json({ error: "Lección no disponible" });
        }
        const leccionJson = leccion.toJSON();
        // Por compatibilidad, la lección se sigue devolviendo "plana",
        // solo añadimos un campo adicional `progreso`.
        let progreso = null;
        const user = req.user;
        if (user?.id) {
            const moduloId = Number(leccionJson.modulo_id);
            const modulo = await modulo_model_1.Modulo.findByPk(moduloId);
            if (modulo) {
                const moduloJson = modulo.toJSON();
                const cursoId = Number(moduloJson.curso_id);
                if (Number.isFinite(cursoId)) {
                    const prog = await progreso_leccion_model_1.ProgresoLeccion.findOne({
                        where: {
                            usuario_id: Number(user.id),
                            curso_id: cursoId,
                            modulo_id: moduloId,
                            leccion_id: Number(id),
                        },
                    });
                    if (prog) {
                        const pj = prog.toJSON();
                        progreso = {
                            estado: pj.estado,
                            aprobado: !!pj.aprobado,
                            nota_ultima_prueba: pj.nota_ultima_prueba != null
                                ? Number(pj.nota_ultima_prueba)
                                : null,
                        };
                    }
                    else {
                        // Si el usuario puede ver la clase, al menos está disponible.
                        progreso = {
                            estado: "disponible",
                            aprobado: false,
                            nota_ultima_prueba: null,
                        };
                    }
                }
            }
        }
        return res.json({
            ...leccionJson,
            progreso,
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al obtener la lección" });
    }
};
exports.obtenerLeccionPublica = obtenerLeccionPublica;
