"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const intentoes_controller_1 = require("../controllers/intentoes.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Intentos
router.post("/:id/intentos", intentoes_controller_1.crearIntento); // id = examen_id
router.post("/intentos/:id/respuestas", intentoes_controller_1.registrarRespuestas); // id = intento_id
router.post("/intentos/:id/finalizar", intentoes_controller_1.finalizarIntento);
router.get("/intentos", intentoes_controller_1.listarIntentosUsuario);
router.get("/intentos/:id/pdf", intentoes_controller_1.descargarPDFResultado);
exports.default = router;
