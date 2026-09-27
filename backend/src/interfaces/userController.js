// interfaces/userController.js
// Capa de interfaces (adaptador de entrada): traduce peticiones HTTP (Express)
// en llamadas a los casos de uso del servicio de aplicación.

const express = require('express');

function crearUserRouter(userService) {
  const router = express.Router();

  // POST /usuarios/registro -> registrar un usuario nuevo (requiere captcha)
  router.post('/registro', async (req, res) => {
    try {
      const { nombre, email, password, captchaId, captchaTexto } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
      }
      if (!captchaId || !captchaTexto) {
        return res.status(400).json({ error: 'Debes resolver el captcha' });
      }

      const usuario = await userService.registrarUsuario({
        nombre,
        email,
        password,
        captchaId,
        captchaTexto
      });
      return res.status(201).json(usuario);
    } catch (error) {
      if (error.codigo === 'CAPTCHA_INVALIDO' || error.codigo === 'CAPTCHA_EXPIRADO') {
        return res.status(400).json({ error: error.message });
      }
      if (error.codigo === 'CAPTCHA_INCORRECTO') {
        return res.status(400).json({ error: error.message });
      }
      if (error.codigo === 'EMAIL_DUPLICADO') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes('formato válido') || error.message.includes('al menos 6 caracteres')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error al registrar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST /usuarios/login -> iniciar sesión (requiere captcha)
  router.post('/login', async (req, res) => {
    try {
      const { email, password, captchaId, captchaTexto } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email y password son obligatorios' });
      }
      if (!captchaId || !captchaTexto) {
        return res.status(400).json({ error: 'Debes resolver el captcha' });
      }

      const usuario = await userService.iniciarSesion({ email, password, captchaId, captchaTexto });
      return res.status(200).json(usuario);
    } catch (error) {
      if (error.codigo === 'CAPTCHA_INVALIDO' || error.codigo === 'CAPTCHA_EXPIRADO') {
        return res.status(400).json({ error: error.message });
      }
      if (error.codigo === 'CAPTCHA_INCORRECTO') {
        return res.status(400).json({ error: error.message });
      }
      if (error.codigo === 'NO_APROBADO') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('incorrectos')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error al iniciar sesión:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /usuarios -> listar todos (panel admin)
  router.get('/', async (req, res) => {
    try {
      const usuarios = await userService.listarUsuarios();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /usuarios/pendientes -> listar los que esperan aprobación
  router.get('/pendientes', async (req, res) => {
    try {
      const usuarios = await userService.listarPendientes();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al listar pendientes:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT /usuarios/:id/aprobar -> el admin asigna rol y aprueba/rechaza
  router.put('/:id/aprobar', async (req, res) => {
    try {
      const { id } = req.params;
      const { rol, estado } = req.body;

      if (!estado) {
        return res.status(400).json({ error: 'El campo estado es obligatorio' });
      }

      const usuario = await userService.aprobarUsuario(id, { rol, estado });
      return res.status(200).json(usuario);
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('rol debe ser')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error al aprobar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE /usuarios/:id -> eliminar un usuario
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await userService.eliminarUsuario(id);
      return res.status(204).send();
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}

module.exports = crearUserRouter;
