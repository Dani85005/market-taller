// infrastructure/pedidoRepositoryAdapter.js
// Adaptador: implementación CONCRETA del puerto pedidoRepositoryPort usando PostgreSQL.

const PedidoRepositoryPort = require('../domain/pedidoRepositoryPort');
const { Pedido } = require('../domain/pedido');
const pool = require('./db');

function filaAPedido(fila) {
  return new Pedido({
    id: fila.id,
    productoId: fila.producto_id,
    usuarioId: fila.usuario_id,
    estado: fila.estado,
    creadoEn: fila.creado_en
  });
}

class PedidoRepositoryAdapter extends PedidoRepositoryPort {
  async guardar(pedido) {
    const resultado = await pool.query(
      `INSERT INTO pedidos (producto_id, usuario_id, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pedido.productoId, pedido.usuarioId, pedido.estado]
    );
    return filaAPedido(resultado.rows[0]);
  }

  async buscarPorId(id) {
    const resultado = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (resultado.rows.length === 0) return null;
    return filaAPedido(resultado.rows[0]);
  }

  async listarTodos() {
    const resultado = await pool.query('SELECT * FROM pedidos ORDER BY id ASC');
    return resultado.rows.map(filaAPedido);
  }

  async actualizar(id, datos) {
    const campos = [];
    const valores = [];
    let indice = 1;

    if (datos.estado !== undefined) {
      campos.push(`estado = $${indice++}`);
      valores.push(datos.estado);
    }

    if (campos.length === 0) return this.buscarPorId(id);

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE pedidos SET ${campos.join(', ')} WHERE id = $${indice} RETURNING *`,
      valores
    );
    return filaAPedido(resultado.rows[0]);
  }

  async eliminar(id) {
    const resultado = await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
    return resultado.rowCount > 0;
  }
}

module.exports = PedidoRepositoryAdapter;
