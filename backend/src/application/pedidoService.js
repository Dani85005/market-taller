// application/pedidoService.js
// Capa de aplicación: casos de uso del negocio de Pedido.

const { Pedido } = require('../domain/pedido');

class PedidoService {
  /**
   * @param {import('../domain/pedidoRepositoryPort')} pedidoRepository
   */
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  // Caso de uso: crear un pedido (rol "pedido" solicita un producto del catálogo)
  async crearPedido({ productoId, usuarioId }) {
    const pedido = new Pedido({ productoId, usuarioId });
    const pedidoGuardado = await this.pedidoRepository.guardar(pedido);
    return pedidoGuardado.toPublicJSON();
  }

  // Caso de uso: listar todos los pedidos
  async listarPedidos() {
    const pedidos = await this.pedidoRepository.listarTodos();
    return pedidos.map((p) => p.toPublicJSON());
  }

  // Caso de uso: actualizar estado del pedido (confirmar/cancelar)
  async actualizarPedido(id, { estado }) {
    const pedidoExistente = await this.pedidoRepository.buscarPorId(id);
    if (!pedidoExistente) {
      const error = new Error('Pedido no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    const pedidoActualizado = await this.pedidoRepository.actualizar(id, { estado });
    return pedidoActualizado.toPublicJSON();
  }

  // Caso de uso: eliminar un pedido
  async eliminarPedido(id) {
    const pedidoExistente = await this.pedidoRepository.buscarPorId(id);
    if (!pedidoExistente) {
      const error = new Error('Pedido no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }
    await this.pedidoRepository.eliminar(id);
  }
}

module.exports = PedidoService;
