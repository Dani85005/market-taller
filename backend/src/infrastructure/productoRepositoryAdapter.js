// infrastructure/productoRepositoryAdapter.js
// Adaptador: implementación CONCRETA del puerto productoRepositoryPort usando PostgreSQL.

const ProductoRepositoryPort = require('../domain/productoRepositoryPort');
const { Producto } = require('../domain/producto');
const pool = require('./db');

function filaAProducto(fila) {
  return new Producto({
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio: fila.precio,
    imagenUrl: fila.imagen_url,
    vendedorId: fila.vendedor_id,
    estado: fila.estado,
    creadoEn: fila.creado_en
  });
}

class ProductoRepositoryAdapter extends ProductoRepositoryPort {
  async guardar(producto) {
    const resultado = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen_url, vendedor_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.imagenUrl,
        producto.vendedorId,
        producto.estado
      ]
    );
    return filaAProducto(resultado.rows[0]);
  }

  async buscarPorId(id) {
    const resultado = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (resultado.rows.length === 0) return null;
    return filaAProducto(resultado.rows[0]);
  }

  async listarTodos() {
    const resultado = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    return resultado.rows.map(filaAProducto);
  }

  async listarAprobados() {
    const resultado = await pool.query(
      "SELECT * FROM productos WHERE estado = 'aprobado' ORDER BY id ASC"
    );
    return resultado.rows.map(filaAProducto);
  }

  async listarPendientes() {
    const resultado = await pool.query(
      "SELECT * FROM productos WHERE estado = 'pendiente' ORDER BY id ASC"
    );
    return resultado.rows.map(filaAProducto);
  }

  async actualizar(id, datos) {
    const campos = [];
    const valores = [];
    let indice = 1;

    if (datos.nombre !== undefined) {
      campos.push(`nombre = $${indice++}`);
      valores.push(datos.nombre);
    }
    if (datos.descripcion !== undefined) {
      campos.push(`descripcion = $${indice++}`);
      valores.push(datos.descripcion);
    }
    if (datos.precio !== undefined) {
      campos.push(`precio = $${indice++}`);
      valores.push(datos.precio);
    }
    if (datos.imagenUrl !== undefined) {
      campos.push(`imagen_url = $${indice++}`);
      valores.push(datos.imagenUrl);
    }
    if (datos.estado !== undefined) {
      campos.push(`estado = $${indice++}`);
      valores.push(datos.estado);
    }

    if (campos.length === 0) return this.buscarPorId(id);

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE productos SET ${campos.join(', ')} WHERE id = $${indice} RETURNING *`,
      valores
    );
    return filaAProducto(resultado.rows[0]);
  }

  async eliminar(id) {
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    return resultado.rowCount > 0;
  }
}

module.exports = ProductoRepositoryAdapter;
