// domain/user.js
// Entidad de dominio: representa un Usuario y sus reglas de negocio.
// No conoce nada de HTTP, Express, PostgreSQL ni bcrypt: es lógica pura.

const ROLES_VALIDOS = ['admin', 'producto', 'pedido'];
const ESTADOS_VALIDOS = ['pendiente', 'aprobado', 'rechazado'];

class User {
  constructor({
    id = null,
    nombre,
    email,
    passwordHash,
    rol = null,
    estado = 'pendiente',
    creadoEn = null
  }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.estado = estado;
    this.creadoEn = creadoEn;

    this.validar();
  }

  validar() {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error('El nombre es obligatorio');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      throw new Error('El email no tiene un formato válido');
    }

    if (!this.passwordHash) {
      throw new Error('El password (hash) es obligatorio');
    }

    if (this.rol !== null && !ROLES_VALIDOS.includes(this.rol)) {
      throw new Error(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')} o null`);
    }

    if (!ESTADOS_VALIDOS.includes(this.estado)) {
      throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
  }

  estaAprobado() {
    return this.estado === 'aprobado';
  }

  tieneRolAsignado() {
    return this.rol !== null;
  }

  puedeIniciarSesion() {
    return this.estaAprobado() && this.tieneRolAsignado();
  }

  esAdmin() {
    return this.rol === 'admin';
  }

  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = { User, ROLES_VALIDOS, ESTADOS_VALIDOS };
