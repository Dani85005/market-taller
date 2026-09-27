// domain/productoRepositoryPort.js
// Puerto (interfaz): contrato que debe cumplir cualquier adaptador de
// persistencia para Producto.

class ProductoRepositoryPort {
  // eslint-disable-next-line no-unused-vars
  async guardar(producto) {
    throw new Error('Método guardar() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }

  async listarTodos() {
    throw new Error('Método listarTodos() no implementado');
  }

  // Solo productos aprobados (lo que ve el rol "pedido" tipo Marketplace)
  async listarAprobados() {
    throw new Error('Método listarAprobados() no implementado');
  }

  async listarPendientes() {
    throw new Error('Método listarPendientes() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async actualizar(id, datos) {
    throw new Error('Método actualizar() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async eliminar(id) {
    throw new Error('Método eliminar() no implementado');
  }
}

module.exports = ProductoRepositoryPort;
