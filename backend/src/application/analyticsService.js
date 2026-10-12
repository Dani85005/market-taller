// application/analyticsService.js
// Caso de uso: valida filtros (fechas, límite, agrupación) y pide los datos al puerto.
// No sabe nada de SQL ni de Express.

const AGRUPACIONES = ['dia', 'semana', 'mes'];

function formatoFecha(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function errorValidacion(mensaje) {
  const e = new Error(mensaje);
  e.status = 400;
  return e;
}

class AnalyticsService {
  constructor(analyticsRepository) {
    this.repo = analyticsRepository;
  }

  async esAdministrador(usuarioId) {
    const id = Number(usuarioId);
    if (!Number.isInteger(id) || id <= 0) return false;
    return this.repo.esAdministrador(id);
  }

  // Por defecto: últimos 30 días
  resolverRango({ desde, hasta } = {}) {
    if (!hasta) hasta = formatoFecha(new Date());
    if (!desde) {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      desde = formatoFecha(d);
    }
    const formato = /^\d{4}-\d{2}-\d{2}$/;
    if (!formato.test(desde) || !formato.test(hasta) ||
        isNaN(Date.parse(desde)) || isNaN(Date.parse(hasta))) {
      throw errorValidacion('Las fechas deben tener formato YYYY-MM-DD');
    }
    if (desde > hasta) {
      throw errorValidacion('"desde" no puede ser mayor que "hasta"');
    }
    const dias = (Date.parse(hasta) - Date.parse(desde)) / 86400000;
    if (dias > 730) {
      throw errorValidacion('El rango máximo permitido es de 2 años');
    }
    return { desde, hasta };
  }

  resolverLimite(limite) {
    const n = Number(limite) || 5;
    return Math.min(Math.max(n, 1), 20);
  }

  resolverAgrupacion(agrupacion) {
    const a = agrupacion || 'dia';
    if (!AGRUPACIONES.includes(a)) {
      throw errorValidacion(`agrupacion debe ser una de: ${AGRUPACIONES.join(', ')}`);
    }
    return a;
  }

  async topProductos(query) {
    const rango = this.resolverRango(query);
    const limite = this.resolverLimite(query.limite);
    const datos = await this.repo.topProductos({ ...rango, limite });
    return { rango, limite, datos };
  }

  async ingresos(query) {
    const rango = this.resolverRango(query);
    const agrupacion = this.resolverAgrupacion(query.agrupacion);
    const datos = await this.repo.ingresosPorPeriodo({ ...rango, agrupacion });
    const total = datos.reduce((acc, f) => acc + f.ingresos, 0);
    return { rango, agrupacion, total: Math.round(total * 100) / 100, datos };
  }

  async estados(query) {
    const rango = this.resolverRango(query);
    const datos = await this.repo.distribucionEstados(rango);
    return { rango, datos };
  }

  async ticket(query) {
    const rango = this.resolverRango(query);
    const datos = await this.repo.ticketPromedio(rango);
    return { rango, ...datos };
  }

  // Todo junto, para que el dashboard cargue con una sola petición
  async resumen(query) {
    const [productos, ingresos, estados, ticket] = await Promise.all([
      this.topProductos(query),
      this.ingresos(query),
      this.estados(query),
      this.ticket(query)
    ]);
    return {
      rango: ingresos.rango,
      agrupacion: ingresos.agrupacion,
      topProductos: productos.datos,
      ingresos: { total: ingresos.total, serie: ingresos.datos },
      estados: estados.datos,
      ticket: {
        porPedido: ticket.porPedido,
        porUsuario: ticket.porUsuario,
        pedidos: ticket.pedidos,
        clientes: ticket.clientes,
        ingresos: ticket.ingresos,
        mejoresClientes: ticket.mejoresClientes
      }
    };
  }
}

module.exports = AnalyticsService;
