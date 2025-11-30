"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLeccionesAnidadas = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const leccion_controller_1 = require("../controllers/leccion.controller");
const router = (0, express_1.Router)();
// Todas requieren admin
router.use(auth_1.requireAuth, auth_1.requireAdmin);
// ---- Rutas planas ----
router.get("/", leccion_controller_1.listarLecciones); // GET /api/admin/lecciones?modulo_id=4
router.get("/:id", leccion_controller_1.obtenerLeccionAdmin); // GET /api/admin/lecciones/:id
router.post("/", leccion_controller_1.crearLeccion);
router.put("/:id", leccion_controller_1.actualizarLeccion);
router.delete("/:id", leccion_controller_1.eliminarLeccion);
exports.default = router;
// ---- Ruta anidada bajo /api/admin/modulos/:moduloId/lecciones ----
// Para evitar otro archivo, exportamos también un subrouter.
exports.adminLeccionesAnidadas = (0, express_1.Router)({ mergeParams: true });
exports.adminLeccionesAnidadas.use(auth_1.requireAuth, auth_1.requireAdmin);
exports.adminLeccionesAnidadas.get("/", leccion_controller_1.listarLeccionesPorModulo);
