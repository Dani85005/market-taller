// infrastructure/userRepositoryAdapter.js
// Adaptador: implementación CONCRETA del puerto userRepositoryPort usando PostgreSQL.

const UserRepositoryPort = require('../domain/userRepositoryPort');
const { User } = require('../domain/user');
const pool = require('./db');

function filaAUser(fila) {
  return new User({
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    passwordHash: fila.password,
    rol: fila.rol,
    estado: fila.estado,
    creadoEn: fila.creado_en
  });
}

class UserRepositoryAdapter extends UserRepositoryPort {
  async guardar(user) {
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.nombre, user.email, user.passwordHash, user.rol, user.estado]
    );
    return filaAUser(resultado.rows[0]);
  }

  async buscarPorEmail(email) {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) return null;
    return filaAUser(resultado.rows[0]);
  }

  async buscarPorId(id) {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (resultado.rows.length === 0) return null;
    return filaAUser(resultado.rows[0]);
  }

  async listarTodos() {
    const resultado = await pool.query('SELECT * FROM usuarios ORDER BY id ASC');
    return resultado.rows.map(filaAUser);
  }

  async listarPendientes() {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE estado = 'pendiente' ORDER BY id ASC"
    );
    return resultado.rows.map(filaAUser);
  }

  async actualizar(id, datos) {
    const campos = [];
    const valores = [];
    let indice = 1;

    if (datos.nombre !== undefined) {
      campos.push(`nombre = $${indice++}`);
      valores.push(datos.nombre);
    }
    if (datos.email !== undefined) {
      campos.push(`email = $${indice++}`);
      valores.push(datos.email);
    }
    if (datos.passwordHash !== undefined) {
      campos.push(`password = $${indice++}`);
      valores.push(datos.passwordHash);
    }
    if (datos.rol !== undefined) {
      campos.push(`rol = $${indice++}`);
      valores.push(datos.rol);
    }
    if (datos.estado !== undefined) {
      campos.push(`estado = $${indice++}`);
      valores.push(datos.estado);
    }

    if (campos.length === 0) return this.buscarPorId(id);

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${indice} RETURNING *`,
      valores
    );
    return filaAUser(resultado.rows[0]);
  }

  async eliminar(id) {
    const resultado = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return resultado.rowCount > 0;
  }
}

module.exports = UserRepositoryAdapter;
