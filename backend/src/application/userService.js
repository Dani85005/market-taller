// application/userService.js
// Capa de aplicación: orquesta los casos de uso del negocio de Usuario.

const bcrypt = require('bcrypt');
const { User, ROLES_VALIDOS } = require('../domain/user');

const SALT_ROUNDS = 10;

class UserService {
  /**
   * @param {import('../domain/userRepositoryPort')} userRepository
   * @param {import('./captchaService')} captchaService
   */
  constructor(userRepository, captchaService) {
    this.userRepository = userRepository;
    this.captchaService = captchaService;
  }

  // Caso de uso: registrar un usuario nuevo (requiere captcha válido)
  async registrarUsuario({ nombre, email, password, captchaId, captchaTexto }) {
    await this.captchaService.validarCaptcha(captchaId, captchaTexto);

    if (!password || password.length < 6) {
      throw new Error('El password debe tener al menos 6 caracteres');
    }

    const existente = await this.userRepository.buscarPorEmail(email);
    if (existente) {
      const error = new Error('Ya existe un usuario con ese email');
      error.codigo = 'EMAIL_DUPLICADO';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ nombre, email, passwordHash });

    const usuarioGuardado = await this.userRepository.guardar(user);
    return usuarioGuardado.toPublicJSON();
  }

  // Caso de uso: iniciar sesión (requiere captcha válido)
  async iniciarSesion({ email, password, captchaId, captchaTexto }) {
    await this.captchaService.validarCaptcha(captchaId, captchaTexto);

    const usuario = await this.userRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Email o contraseña incorrectos');
    }

    const coincide = await bcrypt.compare(password, usuario.passwordHash);
    if (!coincide) {
      throw new Error('Email o contraseña incorrectos');
    }

    if (!usuario.puedeIniciarSesion()) {
      const error = new Error('Tu cuenta aún no ha sido aprobada por un administrador');
      error.codigo = 'NO_APROBADO';
      throw error;
    }

    return usuario.toPublicJSON();
  }

  // Caso de uso: listar todos los usuarios (panel admin)
  async listarUsuarios() {
    const usuarios = await this.userRepository.listarTodos();
    return usuarios.map((u) => u.toPublicJSON());
  }

  // Caso de uso: listar usuarios pendientes de aprobación
  async listarPendientes() {
    const usuarios = await this.userRepository.listarPendientes();
    return usuarios.map((u) => u.toPublicJSON());
  }

  // Caso de uso: el admin aprueba/rechaza y asigna rol a un usuario
  async aprobarUsuario(id, { rol, estado }) {
    const usuarioExistente = await this.userRepository.buscarPorId(id);
    if (!usuarioExistente) {
      const error = new Error('Usuario no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    if (estado === 'aprobado' && !ROLES_VALIDOS.includes(rol)) {
      throw new Error(`Para aprobar, el rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
    }

    const usuarioActualizado = await this.userRepository.actualizar(id, { rol, estado });
    return usuarioActualizado.toPublicJSON();
  }

  // Caso de uso: eliminar un usuario
  async eliminarUsuario(id) {
    const usuarioExistente = await this.userRepository.buscarPorId(id);
    if (!usuarioExistente) {
      const error = new Error('Usuario no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }
    await this.userRepository.eliminar(id);
  }
}

module.exports = UserService;
