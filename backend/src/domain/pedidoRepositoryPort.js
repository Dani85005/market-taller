// domain/pedidoRepositoryPort.js
// Puerto (interfaz): contrato que debe cumplir cualquier adaptador de
// persistencia para Pedido.

class PedidoRepositoryPort {
  // eslint-disable-next-line no-unused-vars
  async guardar(pedido) {
    throw new Error('Método guardar() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }

  async listarTodos() {
    throw new Error('Método listarTodos() no implementado');
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

module.exports = PedidoRepositoryPort;
