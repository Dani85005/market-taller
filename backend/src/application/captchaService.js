// application/captchaService.js
// Capa de aplicación: genera el desafío de captcha y las 10 imágenes SVG,
// y valida la respuesta del usuario.

const crypto = require('crypto');
const { Captcha } = require('../domain/captcha');

const COLORES = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2'];

// Genera un SVG individual para UN carácter, con distorsión (rotación + color aleatorio)
function generarImagenSVG(caracter) {
  const rotacion = Math.floor(Math.random() * 40) - 20; // entre -20 y 20 grados
  const color = COLORES[Math.floor(Math.random() * COLORES.length)];
  const ruido = Math.floor(Math.random() * 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
    <rect width="40" height="50" fill="#f3f4f6"/>
    <line x1="${5 + ruido}" y1="5" x2="${35 - ruido}" y2="45" stroke="#d1d5db" stroke-width="1"/>
    <text x="20" y="32" font-family="Arial, sans-serif" font-size="26" font-weight="bold"
      fill="${color}" text-anchor="middle" transform="rotate(${rotacion} 20 25)">${caracter}</text>
  </svg>`;
}

class CaptchaService {
  /**
   * @param {import('../domain/captchaRepositoryPort')} captchaRepository
   */
  constructor(captchaRepository) {
    this.captchaRepository = captchaRepository;
  }

  // Caso de uso: generar un nuevo captcha con sus 10 imágenes
  async generarCaptcha() {
    const id = crypto.randomUUID();
    const captcha = new Captcha({ id });

    await this.captchaRepository.guardar(captcha);

    // Convierte cada carácter del código en una imagen SVG individual
    const imagenes = captcha.codigo.split('').map((caracter) => generarImagenSVG(caracter));

    return {
      captchaId: captcha.id,
      imagenes // array de 10 strings SVG
    };
  }

  // Caso de uso: validar la respuesta del usuario
  async validarCaptcha(captchaId, textoIngresado) {
    const captcha = await this.captchaRepository.buscarPorId(captchaId);

    if (!captcha) {
      const error = new Error('El captcha no existe o ya expiró, solicita uno nuevo');
      error.codigo = 'CAPTCHA_INVALIDO';
      throw error;
    }

    if (captcha.haExpirado()) {
      await this.captchaRepository.eliminar(captchaId);
      const error = new Error('El captcha expiró, solicita uno nuevo');
      error.codigo = 'CAPTCHA_EXPIRADO';
      throw error;
    }

    const esValido = captcha.validar(textoIngresado);

    // El captcha se usa una sola vez, sin importar si acertó o no
    await this.captchaRepository.eliminar(captchaId);

    if (!esValido) {
      const error = new Error('El texto del captcha no coincide');
      error.codigo = 'CAPTCHA_INCORRECTO';
      throw error;
    }

    return true;
  }
}

module.exports = CaptchaService;
