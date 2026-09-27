// domain/producto.js
// Entidad de dominio: representa un Producto y sus reglas de negocio.

const ESTADOS_VALIDOS = ['pendiente', 'aprobado', 'rechazado'];

class Producto {
  constructor({
    id = null,
    nombre,
    descripcion = '',
    precio,
    imagenUrl = null,
    vendedorId,
    estado = 'pendiente',
    creadoEn = null
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.imagenUrl = imagenUrl;
    this.vendedorId = vendedorId;
    this.estado = estado;
    this.creadoEn = creadoEn;

    this.validar();
  }

  validar() {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error('El nombre del producto es obligatorio');
    }

    if (this.precio === undefined || this.precio === null || Number(this.precio) <= 0) {
      throw new Error('El precio debe ser un número mayor a 0');
    }

    if (!this.vendedorId) {
      throw new Error('El producto debe estar asociado a un vendedor');
    }

    if (!ESTADOS_VALIDOS.includes(this.estado)) {
      throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
  }

  estaAprobado() {
    return this.estado === 'aprobado';
  }

  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      imagenUrl: this.imagenUrl,
      vendedorId: this.vendedorId,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = { Producto, ESTADOS_VALIDOS };
