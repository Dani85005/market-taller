// application/emailTemplates.js

const escapar = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const dinero = (n) =>
  Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// Correo para el CLIENTE: desglose + instrucciones de pago
function generarCorreoCliente({ pedido, producto, usuario, datosBancarios }) {
  const referencia = `PED-${pedido.id}`;
  const precioUnitario = Number(producto.precio);

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #333;">
    <h2 style="color:#007bff;">¡Gracias por tu pedido, ${escapar(usuario.nombre)}!</h2>
    <p>Tu pedido <b>#${pedido.id}</b> fue registrado con estado
       <b>Pendiente de pago</b>.</p>

    <h3>Desglose de tu compra</h3>
    <table style="width:100%; border-collapse: collapse;">
      <tr style="background:#f0f2f5;">
        <th style="text-align:left; padding:8px;">Producto</th>
        <th style="padding:8px;">Cant.</th>
        <th style="text-align:right; padding:8px;">Precio</th>
        <th style="text-align:right; padding:8px;">Subtotal</th>
      </tr>
      <tr>
        <td style="padding:8px;">${escapar(producto.nombre)}</td>
        <td style="padding:8px; text-align:center;">${pedido.cantidad}</td>
        <td style="padding:8px; text-align:right;">${dinero(precioUnitario)}</td>
        <td style="padding:8px; text-align:right;">${dinero(pedido.total)}</td>
      </tr>
      <tr>
        <td colspan="3" style="padding:8px; text-align:right;"><b>Total a pagar</b></td>
        <td style="padding:8px; text-align:right;"><b>${dinero(pedido.total)}</b></td>
      </tr>
    </table>

    <h3>Datos para realizar tu pago</h3>
    <p>Realiza una transferencia o depósito con los siguientes datos:</p>
    <ul>
      <li><b>Banco:</b> ${escapar(datosBancarios.banco)}</li>
      <li><b>Titular:</b> ${escapar(datosBancarios.titular)}</li>
      <li><b>CLABE:</b> ${escapar(datosBancarios.clabe)}</li>
      <li><b>Referencia / concepto:</b> ${referencia}</li>
      <li><b>Monto exacto:</b> ${dinero(pedido.total)}</li>
    </ul>
    <p>Una vez realizado el pago, responde a este correo con tu comprobante
       indicando la referencia <b>${referencia}</b> para confirmar tu pedido.</p>
  </div>`;

  const text = [
    `Gracias por tu pedido, ${usuario.nombre}.`,
    `Pedido #${pedido.id} - Pendiente de pago`,
    `Producto: ${producto.nombre} x${pedido.cantidad}`,
    `Total a pagar: ${dinero(pedido.total)}`,
    `Banco: ${datosBancarios.banco}`,
    `Titular: ${datosBancarios.titular}`,
    `CLABE: ${datosBancarios.clabe}`,
    `Referencia: ${referencia}`
  ].join('\n');

  return { subject: `Pedido #${pedido.id} - Pendiente de pago`, html, text };
}

// Correo para el ADMINISTRADOR: aviso de pedido nuevo
function generarCorreoAdmin({ pedido, producto, usuario }) {
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #333;">
    <h2 style="color:#dc3545;">Nuevo pedido recibido</h2>
    <ul>
      <li><b>Pedido:</b> #${pedido.id} (Pendiente de pago)</li>
      <li><b>Cliente:</b> ${escapar(usuario.nombre)} (${escapar(usuario.email)})</li>
      <li><b>Producto:</b> ${escapar(producto.nombre)}</li>
      <li><b>Cantidad:</b> ${pedido.cantidad}</li>
      <li><b>Total:</b> ${dinero(pedido.total)}</li>
      <li><b>Referencia de pago:</b> PED-${pedido.id}</li>
    </ul>
    <p>Cuando recibas el comprobante, confirma el pedido desde el panel.</p>
  </div>`;

  const text =
    `Nuevo pedido #${pedido.id} (Pendiente de pago)\n` +
    `Cliente: ${usuario.nombre} (${usuario.email})\n` +
    `Producto: ${producto.nombre} x${pedido.cantidad}\n` +
    `Total: ${dinero(pedido.total)}`;

  return { subject: `[Admin] Nuevo pedido #${pedido.id}`, html, text };
}

module.exports = { generarCorreoCliente, generarCorreoAdmin };
