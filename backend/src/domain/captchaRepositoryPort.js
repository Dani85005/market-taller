// domain/captchaRepositoryPort.js
// Puerto: contrato para guardar/consultar captchas temporalmente.

class CaptchaRepositoryPort {
  // eslint-disable-next-line no-unused-vars
  async guardar(captcha) {
    throw new Error('Método guardar() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async buscarPorId(id) {
    throw new Error('Método buscarPorId() no implementado');
  }

  // eslint-disable-next-line no-unused-vars
  async eliminar(id) {
    throw new Error('Método eliminar() no implementado');
  }
}

module.exports = CaptchaRepositoryPort;
