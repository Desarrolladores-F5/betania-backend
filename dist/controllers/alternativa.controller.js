"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarAlternativa = exports.actualizarAlternativa = exports.crearAlternativa = void 0;
const alternativa_model_1 = require("../models/alternativa.model");
const pregunta_model_1 = require("../models/pregunta.model");
const crearAlternativa = async (req, res) => {
    try {
        const { pregunta_id, texto, es_correcta } = req.body;
        const p = await pregunta_model_1.Pregunta.findByPk(pregunta_id);
        if (!p)
            return res.status(400).json({ error: "pregunta_id inválido" });
        const alternativa = await alternativa_model_1.Alternativa.create({
            pregunta_id, texto, es_correcta: !!es_correcta
        });
        return res.status(201).json(alternativa);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "No se pudo crear la alternativa" });
    }
};
exports.crearAlternativa = crearAlternativa;
const actualizarAlternativa = async (req, res) => {
    try {
        const { id } = req.params;
        const alt = await alternativa_model_1.Alternativa.findByPk(id);
        if (!alt)
            return res.status(404).json({ error: "Alternativa no encontrada" });
        await alt.update(req.body);
        return res.json(alt);
    }
    catch {
        return res.status(500).json({ error: "Error al actualizar alternativa" });
    }
};
exports.actualizarAlternativa = actualizarAlternativa;
const eliminarAlternativa = async (req, res) => {
    try {
        const { id } = req.params;
        const alt = await alternativa_model_1.Alternativa.findByPk(id);
        if (!alt)
            return res.status(404).json({ error: "Alternativa no encontrada" });
        await alt.destroy();
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Error al eliminar alternativa" });
    }
};
exports.eliminarAlternativa = eliminarAlternativa;
