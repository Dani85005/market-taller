// infrastructure/analyticsRepositoryAdapter.js
// Adaptador: implementa AnalyticsRepositoryPort con agregaciones SQL en PostgreSQL.

const AnalyticsRepositoryPort = require('../domain/analyticsRepositoryPort');
const pool = require('./db');

// Estados que cuentan como dinero ingresado
const ESTADOS_INGRESO = ['pagado', 'confirmado', 'enviado'];

// Filtro de fechas reutilizable: "hasta" es inclusivo (incluye todo ese día)
const FILTRO_FECHAS = (col, p1, p2) =>
  `${col} >= $${p1}::date AND ${col} < ($${p2}::date + 1)`;

const UNIDAD_SQL = { dia: 'day', semana: 'week', mes: 'month' };

class AnalyticsRepositoryAdapter extends AnalyticsRepositoryPort {
  // Top N productos más vendidos (unidades + ingresos)
  async topProductos({ desde, hasta, limite }) {
    const r = await pool.query(
      `SELECT p.id, p.nombre,
              SUM(pe.cantidad)::int AS unidades,
              SUM(pe.total) AS ingresos
       FROM pedidos pe
       JOIN productos p ON p.id = pe.producto_id
       WHERE pe.estado = ANY($1) AND ${FILTRO_FECHAS('pe.creado_en', 2, 3)}
       GROUP BY p.id, p.nombre
       ORDER BY unidades DESC, ingresos DESC
       LIMIT $4`,
      [ESTADOS_INGRESO, desde, hasta, limite]
    );
    return r.rows.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      unidades: f.unidades,
      ingresos: Number(f.ingresos)
    }));
  }

  // Ingresos por día / semana / mes (rellena con 0 los periodos sin ventas)
  async ingresosPorPeriodo({ desde, hasta, agrupacion }) {
    const unidad = UNIDAD_SQL[agrupacion];
    const r = await pool.query(
      `WITH serie AS (
         SELECT generate_series(
                  date_trunc($1, $2::date::timestamp),
                  date_trunc($1, $3::date::timestamp),
                  ('1 ' || $1)::interval
                ) AS periodo
       )
       SELECT to_char(s.periodo, 'YYYY-MM-DD') AS periodo,
              COALESCE(SUM(pe.total), 0) AS ingresos,
              COUNT(pe.id)::int AS pedidos
       FROM serie s
       LEFT JOIN pedidos pe
         ON date_trunc($1, pe.creado_en) = s.periodo
        AND pe.estado = ANY($4)
        AND ${FILTRO_FECHAS('pe.creado_en', 2, 3)}
       GROUP BY s.periodo
       ORDER BY s.periodo`,
      [unidad, desde, hasta, ESTADOS_INGRESO]
    );
    return r.rows.map((f) => ({
      periodo: f.periodo,
      ingresos: Number(f.ingresos),
      pedidos: f.pedidos
    }));
  }

  // Distribución de pedidos por estado (cantidad + porcentaje)
  async distribucionEstados({ desde, hasta }) {
    const r = await pool.query(
      `SELECT estado,
              COUNT(*)::int AS cantidad,
              ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS porcentaje
       FROM pedidos
       WHERE ${FILTRO_FECHAS('creado_en', 1, 2)}
       GROUP BY estado
       ORDER BY cantidad DESC`,
      [desde, hasta]
    );
    return r.rows.map((f) => ({
      estado: f.estado,
      cantidad: f.cantidad,
      porcentaje: Number(f.porcentaje)
    }));
  }

  // Ticket promedio: por pedido, por usuario y ranking de mejores clientes
  async ticketPromedio({ desde, hasta }) {
    const general = await pool.query(
      `SELECT COALESCE(ROUND(AVG(total), 2), 0) AS por_pedido,
              COALESCE(ROUND(SUM(total) / NULLIF(COUNT(DISTINCT usuario_id), 0), 2), 0) AS por_usuario,
              COUNT(*)::int AS pedidos,
              COUNT(DISTINCT usuario_id)::int AS clientes,
              COALESCE(SUM(total), 0) AS ingresos
       FROM pedidos
       WHERE estado = ANY($1) AND ${FILTRO_FECHAS('creado_en', 2, 3)}`,
      [ESTADOS_INGRESO, desde, hasta]
    );
    const porUsuario = await pool.query(
      `SELECT u.id, u.nombre,
              COUNT(*)::int AS pedidos,
              ROUND(AVG(pe.total), 2) AS ticket_promedio,
              SUM(pe.total) AS total_gastado
       FROM pedidos pe
       JOIN usuarios u ON u.id = pe.usuario_id
       WHERE pe.estado = ANY($1) AND ${FILTRO_FECHAS('pe.creado_en', 2, 3)}
       GROUP BY u.id, u.nombre
       ORDER BY total_gastado DESC
       LIMIT 10`,
      [ESTADOS_INGRESO, desde, hasta]
    );
    const g = general.rows[0];
    return {
      porPedido: Number(g.por_pedido),
      porUsuario: Number(g.por_usuario),
      pedidos: g.pedidos,
      clientes: g.clientes,
      ingresos: Number(g.ingresos),
      mejoresClientes: porUsuario.rows.map((f) => ({
        id: f.id,
        nombre: f.nombre,
        pedidos: f.pedidos,
        ticketPromedio: Number(f.ticket_promedio),
        totalGastado: Number(f.total_gastado)
      }))
    };
  }

  // Para el guard de acceso: ¿el usuario es admin aprobado?
  async esAdministrador(usuarioId) {
    const r = await pool.query(
      `SELECT 1 FROM usuarios WHERE id = $1 AND rol = 'admin' AND estado = 'aprobado'`,
      [usuarioId]
    );
    return r.rowCount > 0;
  }
}

module.exports = AnalyticsRepositoryAdapter;
