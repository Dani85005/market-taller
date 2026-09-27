// interfaces/pedidoController.js
// Capa de interfaces: rutas HTTP para Pedido.

const express = require('express');

function crearPedidoRouter(pedidoService) {
  const router = express.Router();

  // POST /pedidos -> crear un pedido (rol "pedido" solicita un producto)
  router.post('/', async (req, res) => {
    try {
      const { productoId, usuarioId } = req.body;

      if (!productoId || !usuarioId) {
        return res.status(400).json({ error: 'productoId y usuarioId son obligatorios' });
      }

      const pedido = await pedidoService.crearPedido({ productoId, usuarioId });
      return res.status(201).json(pedido);
    } catch (error) {
      if (error.message.includes('obligatorio')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error al crear pedido:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /pedidos -> listar todos
  router.get('/', async (req, res) => {
    try {
      const pedidos = await pedidoService.listarPedidos();
      return res.status(200).json(pedidos);
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT /pedidos/:id -> actualizar estado (confirmar/cancelar)
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({ error: 'El campo estado es obligatorio' });
      }

      const pedido = await pedidoService.actualizarPedido(id, { estado });
      return res.status(200).json(pedido);
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al actualizar pedido:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE /pedidos/:id -> eliminar pedido
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pedidoService.eliminarPedido(id);
      return res.status(204).send();
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al eliminar pedido:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}

module.exports = crearPedidoRouter;
