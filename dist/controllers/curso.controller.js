"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerCursoConContenido = exports.listarCursosPublico = exports.eliminarCurso = exports.actualizarCurso = exports.obtenerCursoAdmin = exports.listarCursosAdmin = exports.crearCurso = void 0;
const curso_model_1 = require("../models/curso.model");
const modulo_model_1 = require("../models/modulo.model");
const leccion_model_1 = require("../models/leccion.model");
const progreso_modulo_model_1 = require("../models/progreso_modulo.model");
const progreso_leccion_model_1 = require("../models/progreso_leccion.model");
/* ============================================================
 *  CRUD ADMIN
 * ============================================================ */
const crearCurso = async (req, res) => {
    try {
        const { titulo, descripcion, portada_url, publicado, activo } = req.body;
        const curso = await curso_model_1.Curso.create({
            titulo,
            descripcion: descripcion ?? null,
            portada_url: portada_url ?? null,
            publicado: !!publicado,
            activo: activo ?? true,
        });
        return res.status(201).json(curso);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudo crear el curso" });
    }
};
exports.crearCurso = crearCurso;
const listarCursosAdmin = async (_req, res) => {
    try {
        const cursos = await curso_model_1.Curso.findAll({ order: [["id", "DESC"]] });
        return res.json(cursos);
    }
    catch {
        return res.status(500).json({ error: "Error al listar cursos" });
    }
};
exports.listarCursosAdmin = listarCursosAdmin;
const obtenerCursoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await curso_model_1.Curso.findByPk(id, {
            include: [
                {
                    model: modulo_model_1.Modulo,
                    as: "modulos",
                    include: [{ model: leccion_model_1.Leccion, as: "lecciones" }],
                },
            ],
        });
        if (!curso)
            return res.status(404).json({ error: "Curso no encontrado" });
        return res.json(curso);
    }
    catch {
        return res.status(500).json({ error: "Error al obtener curso" });
    }
};
exports.obtenerCursoAdmin = obtenerCursoAdmin;
const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await curso_model_1.Curso.findByPk(id);
        if (!curso)
            return res.status(404).json({ error: "Curso no encontrado" });
        await curso.update(req.body);
        return res.json(curso);
    }
    catch {
        return res.status(500).json({ error: "Error al actualizar curso" });
    }
};
exports.actualizarCurso = actualizarCurso;
const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await curso_model_1.Curso.findByPk(id);
        if (!curso)
            return res.status(404).json({ error: "Curso no encontrado" });
        await curso.destroy();
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Error al eliminar curso" });
    }
};
exports.eliminarCurso = eliminarCurso;
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
async function inicializarProgresoSiNecesario(cursoInstancia, usuarioId) {
    if (!usuarioId || !cursoInstancia?.id)
        return;
    const cursoId = Number(cursoInstancia.id);
    // ¿Ya existe progreso para este usuario y curso?
    const yaExiste = await progreso_modulo_model_1.ProgresoModulo.count({
        where: { usuario_id: usuarioId, curso_id: cursoId },
    });
    if (yaExiste > 0) {
        // Ya fue inicializado antes
        return;
    }
    // Trabajamos sobre un JSON del curso para acceder a modulos/lecciones
    const json = cursoInstancia.toJSON();
    const modulosRaw = Array.isArray(json.modulos) ? json.modulos : [];
    if (modulosRaw.length === 0) {
        // No hay módulos, no hay nada que inicializar
        return;
    }
    // Ordenamos módulos por orden, luego por id
    const modulosOrdenados = modulosRaw
        .map((m) => ({
        ...m,
        id: Number(m.id),
        orden: typeof m.orden === "number"
            ? m.orden
            : m.orden != null
                ? Number(m.orden)
                : null,
    }))
        .sort((a, b) => {
        const ao = a.orden ?? 9999;
        const bo = b.orden ?? 9999;
        if (ao !== bo)
            return ao - bo;
        return a.id - b.id;
    });
    const ahora = new Date();
    // 1) Crear progreso por módulo
    for (let i = 0; i < modulosOrdenados.length; i++) {
        const m = modulosOrdenados[i];
        const estadoModulo = i === 0 ? "disponible" : "bloqueado";
        await progreso_modulo_model_1.ProgresoModulo.create({
            usuario_id: usuarioId,
            curso_id: cursoId,
            modulo_id: m.id,
            estado: estadoModulo,
            fecha_desbloqueo: estadoModulo === "disponible" ? ahora : null,
            fecha_completado: null,
        });
    }
    // 2) Crear progreso por lección SOLO para el primer módulo
    const primerModulo = modulosOrdenados[0];
    const leccionesRaw = Array.isArray(primerModulo.lecciones)
        ? primerModulo.lecciones
        : [];
    if (leccionesRaw.length === 0) {
        return;
    }
    const leccionesOrdenadas = leccionesRaw
        .map((l) => ({
        ...l,
        id: Number(l.id),
        orden: typeof l.orden === "number"
            ? l.orden
            : l.orden != null
                ? Number(l.orden)
                : null,
    }))
        .sort((a, b) => {
        const ao = a.orden ?? 9999;
        const bo = b.orden ?? 9999;
        if (ao !== bo)
            return ao - bo;
        return a.id - b.id;
    });
    for (let i = 0; i < leccionesOrdenadas.length; i++) {
        const l = leccionesOrdenadas[i];
        const estadoLeccion = i === 0 ? "disponible" : "bloqueada";
        await progreso_leccion_model_1.ProgresoLeccion.create({
            usuario_id: usuarioId,
            curso_id: cursoId,
            modulo_id: primerModulo.id,
            leccion_id: l.id,
            estado: estadoLeccion,
            aprobado: false, // requerido por el modelo / BD
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
 * Por ahora devolvemos todos los cursos (podrás filtrar después por inscripción).
 */
const listarCursosPublico = async (_req, res) => {
    try {
        const cursos = await curso_model_1.Curso.findAll({
            order: [["id", "DESC"]],
            attributes: ["id", "titulo", "descripcion", "portada_url"],
        });
        return res.json(cursos);
    }
    catch (e) {
        console.error("Error al listar cursos públicos:", e);
        return res
            .status(500)
            .json({ error: "Error al listar cursos publicados" });
    }
};
exports.listarCursosPublico = listarCursosPublico;
/**
 * Detalle del curso para el alumno:
 *  - Inicializa progreso de módulos y lecciones (si es la primera vez).
 *  - Devuelve SOLO módulos con su estado (bloqueado / disponible / completado).
 *  - NO devuelve aún las lecciones (eso lo haremos en la vista del módulo).
 */
const obtenerCursoConContenido = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user; // viene de requireAuth
        if (!user?.id) {
            return res.status(401).json({ error: "No autenticado" });
        }
        const usuarioId = Number(user.id);
        // Traemos el curso con módulos + lecciones (las lecciones solo para inicializar progreso)
        const curso = await curso_model_1.Curso.findOne({
            where: { id },
            attributes: ["id", "titulo", "descripcion", "portada_url"],
            include: [
                {
                    model: modulo_model_1.Modulo,
                    as: "modulos",
                    attributes: ["id", "titulo", "descripcion", "orden"],
                    include: [
                        {
                            model: leccion_model_1.Leccion,
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
        // 1) Inicializar progreso (solo la primera vez)
        await inicializarProgresoSiNecesario(curso, usuarioId);
        // 2) Volvemos a cargar progreso de módulos para este usuario+curso
        const progresoModulos = await progreso_modulo_model_1.ProgresoModulo.findAll({
            where: { usuario_id: usuarioId, curso_id: Number(curso.id) },
        });
        // 3) Armamos respuesta JSON: solo módulos con su estado
        const json = curso.toJSON();
        const modulosRaw = Array.isArray(json.modulos) ? json.modulos : [];
        const modulosOrdenados = modulosRaw
            .map((m) => ({
            ...m,
            id: Number(m.id),
            orden: typeof m.orden === "number"
                ? m.orden
                : m.orden != null
                    ? Number(m.orden)
                    : null,
        }))
            .sort((a, b) => {
            const ao = a.orden ?? 9999;
            const bo = b.orden ?? 9999;
            if (ao !== bo)
                return ao - bo;
            return a.id - b.id;
        })
            .map((m) => {
            const prog = progresoModulos.find((p) => Number(p.modulo_id) === Number(m.id));
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
            portada_url: json.portada_url,
            modulos: modulosOrdenados,
        };
        return res.json(respuesta);
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ error: "Error al obtener contenido del curso" });
    }
};
exports.obtenerCursoConContenido = obtenerCursoConContenido;
