class EmailServicePort {
  // eslint-disable-next-line no-unused-vars
  async enviarCorreo({ to, subject, html, text }) {
    throw new Error('Método enviarCorreo() no implementado');
  }
}

module.exports = EmailServicePort;
