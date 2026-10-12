// src/server.js
// Composition root: aquí se conectan puertos y adaptadores.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Captcha
const CaptchaStoreAdapter = require('./infrastructure/captchaStoreAdapter');
const CaptchaService = require('./application/captchaService');
const crearCaptchaRouter = require('./interfaces/captchaController');

// Usuario
const UserRepositoryAdapter = require('./infrastructure/userRepositoryAdapter');
const UserService = require('./application/userService');
const crearUserRouter = require('./interfaces/userController');

// Producto
const ProductoRepositoryAdapter = require('./infrastructure/productoRepositoryAdapter');
const ProductoService = require('./application/productoService');
const crearProductoRouter = require('./interfaces/productoController');

// Pedido
const PedidoRepositoryAdapter = require('./infrastructure/pedidoRepositoryAdapter');
const PedidoService = require('./application/pedidoService');
const crearPedidoRouter = require('./interfaces/pedidoController');
const AnalyticsRepositoryAdapter = require('./infrastructure/analyticsRepositoryAdapter');
const AnalyticsService = require('./application/analyticsService');
const crearAnalyticsRouter = require('./interfaces/analyticsController');

// Correo (puerto de salida + adaptador)
const NodemailAdapter = require('./infrastructure/nodemailAdapter');

// Captcha
const captchaRepository = new CaptchaStoreAdapter();
const captchaService = new CaptchaService(captchaRepository);
const captchaRouter = crearCaptchaRouter(captchaService);

// Usuario
const userRepository = new UserRepositoryAdapter();
const userService = new UserService(userRepository, captchaService);
const userRouter = crearUserRouter(userService);

// Producto
const productoRepository = new ProductoRepositoryAdapter();
const productoService = new ProductoService(productoRepository);
const productoRouter = crearProductoRouter(productoService);

// Pedido (recibe el emailService INYECTADO: no sabe que existe Nodemailer)
const pedidoRepository = new PedidoRepositoryAdapter();
const emailService = new NodemailAdapter();
const pedidoService = new PedidoService({
  pedidoRepository,
  productoRepository,
  userRepository,
  emailService,
  adminEmail: process.env.ADMIN_EMAIL,
  datosBancarios: {
    banco: process.env.BANCO_NOMBRE || 'Banco de ejemplo',
    titular: process.env.BANCO_TITULAR || 'Market Taller',
    clabe: process.env.BANCO_CLABE || '000000000000000000'
  }
});
const pedidoRouter = crearPedidoRouter(pedidoService);

const app = express();
app.use(cors());
app.use(express.json());

const analyticsService = new AnalyticsService(new AnalyticsRepositoryAdapter());
app.use('/captcha', captchaRouter);
app.use('/usuarios', userRouter);
app.use('/productos', productoRouter);
app.use('/pedidos', pedidoRouter);
app.use('/api/reportes', crearAnalyticsRouter(analyticsService));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Market (arquitectura hexagonal) funcionando correctamente' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
