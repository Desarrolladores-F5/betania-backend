"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarPregunta = exports.actualizarPregunta = exports.crearPregunta = void 0;
const pregunta_model_1 = require("../models/pregunta.model");
const examen_model_1 = require("../models/examen.model");
const crearPregunta = async (req, res) => {
    try {
        const { examen_id, enunciado, puntaje, orden } = req.body;
        const ex = await examen_model_1.Examen.findByPk(examen_id);
        if (!ex)
            return res.status(400).json({ error: "examen_id inválido" });
        const pregunta = await pregunta_model_1.Pregunta.create({
            examen_id, enunciado, puntaje: puntaje ?? 1, orden: orden ?? 1
        });
        return res.status(201).json(pregunta);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudo crear la pregunta" });
    }
};
exports.crearPregunta = crearPregunta;
const actualizarPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const pregunta = await pregunta_model_1.Pregunta.findByPk(id);
        if (!pregunta)
            return res.status(404).json({ error: "Pregunta no encontrada" });
        await pregunta.update(req.body);
        return res.json(pregunta);
    }
    catch {
        return res.status(500).json({ error: "Error al actualizar pregunta" });
    }
};
exports.actualizarPregunta = actualizarPregunta;
const eliminarPregunta = async (req, res) => {
    try {
        const { id } = req.params;
        const pregunta = await pregunta_model_1.Pregunta.findByPk(id);
        if (!pregunta)
            return res.status(404).json({ error: "Pregunta no encontrada" });
        await pregunta.destroy();
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Error al eliminar pregunta" });
    }
};
exports.eliminarPregunta = eliminarPregunta;
