const fs = require('fs');

const datos = JSON.parse(fs.readFileSync('captcha_prueba.json', 'utf-8'));

const html = `<!DOCTYPE html>
<html>
<head><title>Prueba de Captcha</title></head>
<body style="font-family: Arial; padding: 20px;">
  <h2>Captcha ID: ${datos.captchaId}</h2>
  <div style="display: flex; gap: 5px; border: 2px solid #333; padding: 10px; width: fit-content;">
    ${datos.imagenes.join('')}
  </div>
</body>
</html>`;

fs.writeFileSync('captcha_prueba.html', html);
console.log('Archivo captcha_prueba.html creado');
