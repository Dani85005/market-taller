// infrastructure/nodemailAdapter.js
// Adaptador de SALIDA: implementa EmailServicePort usando Nodemailer.
// Es el ÚNICO archivo que conoce Nodemailer. Para cambiar de proveedor

require('dotenv').config();
const nodemailer = require('nodemailer');
const EmailServicePort = require('../domain/emailServicePort');

class NodemailAdapter extends EmailServicePort {
  constructor() {
    super();
    this.transporter = null;
    this.from = process.env.MAIL_FROM || 'Market Taller <no-reply@market.local>';
  }

  async obtenerTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Mailtrap (u otro SMTP) configurado en .env
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      console.log('[Email] Usando SMTP configurado:', process.env.SMTP_HOST);
    } else {
      // Ethereal: cuenta de pruebas automática (los correos nunca se entregan de verdad)
      const cuenta = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: cuenta.smtp.host,
        port: cuenta.smtp.port,
        secure: cuenta.smtp.secure,
        auth: { user: cuenta.user, pass: cuenta.pass }
      });
      console.log('[Email] Cuenta Ethereal de pruebas creada.');
      console.log('[Email] Bandeja: https://ethereal.email/login');
      console.log(`[Email] Usuario: ${cuenta.user}  Password: ${cuenta.pass}`);
    }

    return this.transporter;
  }

  async enviarCorreo({ to, subject, html, text }) {
    const transporter = await this.obtenerTransporter();
    const info = await transporter.sendMail({ from: this.from, to, subject, text, html });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    if (previewUrl) {
      console.log(`[Email] Enviado a ${to}. Vista previa: ${previewUrl}`);
    } else {
      console.log(`[Email] Enviado a ${to} (${info.messageId})`);
    }

    return { messageId: info.messageId, previewUrl };
  }
}

module.exports = NodemailAdapter;
