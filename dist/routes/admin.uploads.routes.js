"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.post("/imagen", upload_1.uploadImage.single("file"), (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: "Archivo requerido" });
    const relative = `/uploads/images/${file.filename}`;
    const absolute = `${req.protocol}://${req.get("host")}${relative}`;
    return res.status(201).json({ url: absolute, filename: path_1.default.basename(file.filename), size: file.size, mimetype: file.mimetype });
});
router.post("/pdf", upload_1.uploadPdf.single("file"), (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: "Archivo requerido" });
    const relative = `/uploads/pdfs/${file.filename}`;
    const absolute = `${req.protocol}://${req.get("host")}${relative}`;
    return res.status(201).json({ url: absolute, filename: path_1.default.basename(file.filename), size: file.size, mimetype: file.mimetype });
});
exports.default = router;
