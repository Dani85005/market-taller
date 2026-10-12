// domain/pedido.js
// Entidad de dominio: Pedido. Nace en estado "pendiente_de_pago"

const ESTADOS_VALIDOS = ['pendiente_de_pago', 'pagado', 'confirmado', 'enviado', 'cancelado'];

class Pedido {
  constructor({
    id = null,
    productoId,
    usuarioId,
    cantidad = 1,
    total = 0,
    estado = 'pendiente_de_pago',
    creadoEn = null
  }) {
    this.id = id;
    this.productoId = productoId;
    this.usuarioId = usuarioId;
    this.cantidad = Number(cantidad);
    this.total = Number(total);
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

    if (!Number.isInteger(this.cantidad) || this.cantidad < 1) {
      throw new Error('La cantidad debe ser un entero mayor o igual a 1');
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
      cantidad: this.cantidad,
      total: this.total,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = { Pedido, ESTADOS_VALIDOS };
