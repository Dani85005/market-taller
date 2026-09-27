// src/server.js
// Composition root: aquí se conectan todas las piezas de la arquitectura hexagonal.

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

// Inyección de dependencias - Captcha
const captchaRepository = new CaptchaStoreAdapter();
const captchaService = new CaptchaService(captchaRepository);
const captchaRouter = crearCaptchaRouter(captchaService);

// Inyección de dependencias - Usuario (recibe captchaService también)
const userRepository = new UserRepositoryAdapter();
const userService = new UserService(userRepository, captchaService);
const userRouter = crearUserRouter(userService);

// Inyección de dependencias - Producto
const productoRepository = new ProductoRepositoryAdapter();
const productoService = new ProductoService(productoRepository);
const productoRouter = crearProductoRouter(productoService);

// Inyección de dependencias - Pedido
const pedidoRepository = new PedidoRepositoryAdapter();
const pedidoService = new PedidoService(pedidoRepository);
const pedidoRouter = crearPedidoRouter(pedidoService);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/captcha', captchaRouter);
app.use('/usuarios', userRouter);
app.use('/productos', productoRouter);
app.use('/pedidos', pedidoRouter);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Market (arquitectura hexagonal) funcionando correctamente' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
