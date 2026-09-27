// infrastructure/captchaStoreAdapter.js
// Adaptador: implementación en memoria del puerto captchaRepositoryPort.
// No usa PostgreSQL porque los captchas son datos temporales (viven minutos).

const CaptchaRepositoryPort = require('../domain/captchaRepositoryPort');

const almacenEnMemoria = new Map();

class CaptchaStoreAdapter extends CaptchaRepositoryPort {
  async guardar(captcha) {
    almacenEnMemoria.set(captcha.id, captcha);
    return captcha;
  }

  async buscarPorId(id) {
    return almacenEnMemoria.get(id) || null;
  }

  async eliminar(id) {
    almacenEnMemoria.delete(id);
  }
}

module.exports = CaptchaStoreAdapter;
