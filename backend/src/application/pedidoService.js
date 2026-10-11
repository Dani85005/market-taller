// application/pedidoService.js
// Casos de uso de Pedido. Depende de PUERTOS (repositorios y emailService)

const { Pedido, ESTADOS_VALIDOS } = require('../domain/pedido');
const { generarCorreoCliente, generarCorreoAdmin } = require('./emailTemplates');

class PedidoService {
  constructor({ pedidoRepository, productoRepository, userRepository, emailService, adminEmail, datosBancarios }) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.adminEmail = adminEmail;
    this.datosBancarios = datosBancarios;
  }

  // Caso de uso: registrar pedido "Pendiente de pago" y notificar por correo
  async crearPedido({ productoId, usuarioId, cantidad = 1 }) {
    const producto = await this.productoRepository.buscarPorId(productoId);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }
    if (!producto.estaAprobado()) {
      const error = new Error('El producto no está disponible para pedidos');
      error.codigo = 'PRODUCTO_NO_DISPONIBLE';
      throw error;
    }

    const usuario = await this.userRepository.buscarPorId(usuarioId);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    const total = Math.round(Number(producto.precio) * Number(cantidad) * 100) / 100;
    const pedido = new Pedido({ productoId, usuarioId, cantidad, total });
    const guardado = await this.pedidoRepository.guardar(pedido);

    const notificaciones = await this.notificar({ pedido: guardado, producto, usuario });

    return { ...guardado.toPublicJSON(), notificaciones };
  }

  // Si el correo falla, el pedido YA está guardado: se registra el error y se continúa.
  async notificar({ pedido, producto, usuario }) {
    const resultado = { cliente: false, admin: false };

    try {
      const correo = generarCorreoCliente({
        pedido,
        producto,
        usuario,
        datosBancarios: this.datosBancarios
      });
      await this.emailService.enviarCorreo({ to: usuario.email, ...correo });
      resultado.cliente = true;
    } catch (error) {
      console.error('No se pudo enviar el correo al cliente:', error.message);
    }

    try {
      if (this.adminEmail) {
        const correo = generarCorreoAdmin({ pedido, producto, usuario });
        await this.emailService.enviarCorreo({ to: this.adminEmail, ...correo });
        resultado.admin = true;
      }
    } catch (error) {
      console.error('No se pudo enviar el correo al administrador:', error.message);
    }

    return resultado;
  }

  async listarPedidos() {
    const pedidos = await this.pedidoRepository.listarTodos();
    return pedidos.map((p) => p.toPublicJSON());
  }

  async actualizarPedido(id, { estado }) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    const pedidoExistente = await this.pedidoRepository.buscarPorId(id);
    if (!pedidoExistente) {
      const error = new Error('Pedido no encontrado');
      error.codigo = 'NO_ENCONTRADO';
      throw error;
    }

    const pedidoActualizado = await this.pedidoRepository.actualizar(id, { estado });
    return pedidoActualizado.toPublicJSON();
  }

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
