// domain/captcha.js
// Entidad de dominio: representa un desafío de captcha (10 caracteres al azar).

const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para evitar confusión
const LONGITUD = 10;

function generarCodigoAleatorio() {
  let codigo = '';
  for (let i = 0; i < LONGITUD; i++) {
    codigo += CARACTERES.charAt(Math.floor(Math.random() * CARACTERES.length));
  }
  return codigo;
}

class Captcha {
  constructor({ id, codigo = null, creadoEn = null }) {
    this.id = id;
    this.codigo = codigo || generarCodigoAleatorio();
    this.creadoEn = creadoEn || new Date();
  }

  // Compara el texto ingresado por el usuario contra el código real (sin distinguir mayúsculas)
  validar(textoIngresado) {
    if (!textoIngresado) return false;
    return textoIngresado.trim().toUpperCase() === this.codigo.toUpperCase();
  }

  haExpirado(minutosValidez = 5) {
    const ahora = new Date();
    const diferenciaMs = ahora - new Date(this.creadoEn);
    return diferenciaMs > minutosValidez * 60 * 1000;
  }
}

module.exports = { Captcha, LONGITUD };
