// domain/analyticsRepositoryPort.js
// Puerto de salida: contrato de consultas analíticas (solo lectura).
// El dominio define QUÉ necesita; la infraestructura decide CÓMO (SQL).

class AnalyticsRepositoryPort {
  async topProductos({ desde, hasta, limite }) {
    throw new Error('No implementado: topProductos');
  }
  async ingresosPorPeriodo({ desde, hasta, agrupacion }) {
    throw new Error('No implementado: ingresosPorPeriodo');
  }
  async distribucionEstados({ desde, hasta }) {
    throw new Error('No implementado: distribucionEstados');
  }
  async ticketPromedio({ desde, hasta }) {
    throw new Error('No implementado: ticketPromedio');
  }
  async esAdministrador(usuarioId) {
    throw new Error('No implementado: esAdministrador');
  }
}

module.exports = AnalyticsRepositoryPort;
