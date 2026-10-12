// interfaces/analyticsController.js
// Adaptador de entrada: rutas HTTP de /api/reportes (solo admin).

const express = require('express');

function crearAnalyticsRouter(analyticsService) {
  const router = express.Router();

  // Guard: solo administradores aprobados (header x-usuario-id)
  router.use(async (req, res, next) => {
    try {
      const ok = await analyticsService.esAdministrador(req.header('x-usuario-id'));
      if (!ok) {
        return res.status(403).json({ error: 'Acceso restringido a administradores' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const manejar = (fn) => async (req, res) => {
    try {
      res.json(await fn(req.query));
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };

  router.get('/', manejar((q) => analyticsService.resumen(q)));
  router.get('/productos-top', manejar((q) => analyticsService.topProductos(q)));
  router.get('/ingresos', manejar((q) => analyticsService.ingresos(q)));
  router.get('/estados', manejar((q) => analyticsService.estados(q)));
  router.get('/ticket-promedio', manejar((q) => analyticsService.ticket(q)));

  return router;
}

module.exports = crearAnalyticsRouter;
