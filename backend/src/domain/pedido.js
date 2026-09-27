// domain/pedido.js
// Entidad de dominio: representa un Pedido (interés/solicitud sobre un producto).

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado'];

class Pedido {
  constructor({
    id = null,
    productoId,
    usuarioId,
    estado = 'pendiente',
    creadoEn = null
  }) {
    this.id = id;
    this.productoId = productoId;
    this.usuarioId = usuarioId;
    this.estado = estado;
    this.creadoEn = creadoEn;

    this.validar();
  }

  validar() {
    if (!this.productoId) {
      throw new Error('El pedido debe estar asociado a un producto');
    }

    if (!this.usuarioId) {
      throw new Error('El pedido debe estar asociado a un usuario');
    }

    if (!ESTADOS_VALIDOS.includes(this.estado)) {
      throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
  }

  toPublicJSON() {
    return {
      id: this.id,
      productoId: this.productoId,
      usuarioId: this.usuarioId,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = { Pedido, ESTADOS_VALIDOS };
