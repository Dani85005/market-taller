// interfaces/productoController.js
// Capa de interfaces: rutas HTTP para Producto.

const express = require('express');

function crearProductoRouter(productoService) {
  const router = express.Router();

  // POST /productos -> registrar un producto (rol "producto"), queda pendiente
  router.post('/', async (req, res) => {
    try {
      const { nombre, descripcion, precio, imagenUrl, vendedorId } = req.body;

      if (!nombre || !precio || !vendedorId) {
        return res.status(400).json({ error: 'nombre, precio y vendedorId son obligatorios' });
      }

      const producto = await productoService.registrarProducto({
        nombre,
        descripcion,
        precio,
        imagenUrl,
        vendedorId
      });
      return res.status(201).json(producto);
    } catch (error) {
      if (error.message.includes('obligatorio') || error.message.includes('mayor a 0')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error al registrar producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /productos -> listar todos (panel admin)
  router.get('/', async (req, res) => {
    try {
      const productos = await productoService.listarTodos();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al listar productos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /productos/aprobados -> solo aprobados (vista Marketplace, rol "pedido")
  router.get('/aprobados', async (req, res) => {
    try {
      const productos = await productoService.listarAprobados();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al listar productos aprobados:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /productos/pendientes -> pendientes de aprobación (panel admin)
  router.get('/pendientes', async (req, res) => {
    try {
      const productos = await productoService.listarPendientes();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al listar productos pendientes:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT /productos/:id -> actualizar datos del producto
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, imagenUrl } = req.body;

      const producto = await productoService.actualizarProducto(id, {
        nombre,
        descripcion,
        precio,
        imagenUrl
      });
      return res.status(200).json(producto);
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT /productos/:id/aprobar -> admin aprueba/rechaza el producto
  router.put('/:id/aprobar', async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({ error: 'El campo estado es obligatorio' });
      }

      const producto = await productoService.aprobarProducto(id, { estado });
      return res.status(200).json(producto);
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al aprobar producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE /productos/:id -> eliminar producto
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await productoService.eliminarProducto(id);
      return res.status(204).send();
    } catch (error) {
      if (error.codigo === 'NO_ENCONTRADO') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}

module.exports = crearProductoRouter;
