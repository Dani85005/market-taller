// domain/userRepositoryPort.js
// Puerto (interfaz): define el contrato que cualquier adaptador de persistencia
// debe cumplir. La capa de dominio/aplicación depende de esta abstracción,
// nunca de una implementación concreta (PostgreSQL, Mongo, memoria, etc).

class UserRepositoryPort {
  // eslint-disable-next-line no-unused-vars
  async guardar(user) {
    throw new Error('Método guardar() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async buscarPorEmail(email) {
    throw new Error('Método buscarPorEmail() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }

  async listarTodos() {
    throw new Error('Método listarTodos() no implementado');
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

module.exports = UserRepositoryPort;
