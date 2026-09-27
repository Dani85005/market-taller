// interfaces/captchaController.js
// Capa de interfaces: ruta HTTP para generar el captcha.
// La VALIDACIÓN del captcha no tiene ruta propia — se usa dentro de
// login/registro (ver userController.js), porque siempre va junto a esas acciones.

const express = require('express');

function crearCaptchaRouter(captchaService) {
  const router = express.Router();

  // GET /captcha -> genera un nuevo desafío con 10 imágenes
  router.get('/', async (req, res) => {
    try {
      const resultado = await captchaService.generarCaptcha();
      return res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al generar captcha:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}

module.exports = crearCaptchaRouter;
