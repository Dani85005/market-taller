// application/productoService.js
// Capa de aplicación: casos de uso del negocio de Producto.

const { Producto } = require('../domain/producto');

class ProductoService {
  /**
   * @param {import('../domain/productoRepositoryPort')} productoRepository
   */
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  // Caso de uso: registrar un producto nuevo (rol "producto"). Queda pendiente de aprobación.
  async registrarProducto({ nombre, descripcion, precio, imagenUrl, vendedorId }) {
    const producto = new Producto({
      nombre,
      descripcion,
      precio,
      imagenUrl,
      vendedorId
      // estado = 'pendiente' por defecto
    });

    const productoGuardado = await this.productoRepository.guardar(producto);
    return productoGuardado.toPublicJSON();
  }

  // Caso de uso: listar todos (panel admin)
  async listarTodos() {
    const productos = await this.productoRepository.listarTodos();
    return productos.map((p) => p.toPublicJSON());
  }

  // Caso de uso: listar solo aprobados (lo que ve el rol "pedido", tipo Marketplace)
  async listarAprobados() {
    const productos = await this.productoRepository.listarAprobados();
    return productos.map((p) => p.toPublicJSON());
  }

  // Caso de uso: listar pendientes (panel admin, para aprobar/rechazar)
  async listarPendientes() {
    const productos = await this.productoRepository.listarPendientes();
    return productos.map((p) => p.toPublicJSON());
  }

  // Caso de uso: actualizar un producto (rol "producto", dueño del producto)
  async actualizarProducto(id, datos) {
    const productoExistente = await this.productoRepository.buscarPorId(id);
    if (!productoExistente) {
      const error = new Error('Producto no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    const productoActualizado = await this.productoRepository.actualizar(id, datos);
    return productoActualizado.toPublicJSON();
  }

  // Caso de uso: el admin aprueba o rechaza un producto
  async aprobarProducto(id, { estado }) {
    const productoExistente = await this.productoRepository.buscarPorId(id);
    if (!productoExistente) {
      const error = new Error('Producto no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    const productoActualizado = await this.productoRepository.actualizar(id, { estado });
    return productoActualizado.toPublicJSON();
  }

  // Caso de uso: eliminar un producto
  async eliminarProducto(id) {
    const productoExistente = await this.productoRepository.buscarPorId(id);
    if (!productoExistente) {
      const error = new Error('Producto no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }
    await this.productoRepository.eliminar(id);
  }
}

module.exports = ProductoService;
