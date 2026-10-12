import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API = "http://localhost:4000";

const ETIQUETAS = {
  pendiente_de_pago: "Pendiente",
  pagado: "Pagado",
  confirmado: "Confirmado",
  enviado: "Enviado",
  cancelado: "Cancelado"
};
const COLORES = {
  pendiente_de_pago: "#f59e0b",
  pagado: "#3b82f6",
  confirmado: "#8b5cf6",
  enviado: "#10b981",
  cancelado: "#ef4444"
};

const dinero = (n) =>
  Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function rangoPreset(clave) {
  const hoy = new Date();
  const desde = new Date();
  if (clave === "7") desde.setDate(hoy.getDate() - 6);
  else if (clave === "30") desde.setDate(hoy.getDate() - 29);
  else if (clave === "mes") desde.setDate(1);
  return { desde: fmt(desde), hasta: fmt(hoy) };
}

const estiloCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};
const estiloBoton = (activo) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #3b82f6",
  background: activo ? "#3b82f6" : "#fff",
  color: activo ? "#fff" : "#3b82f6",
  cursor: "pointer",
  fontWeight: 600
});

function DashboardAnalitica({ usuario }) {
  const inicial = rangoPreset("30");
  const [preset, setPreset] = useState("30");
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [agrupacion, setAgrupacion] = useState("dia");
  const [limite, setLimite] = useState(5);
  const [tipoGrafica, setTipoGrafica] = useState("barras");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function elegirPreset(clave) {
    setPreset(clave);
    const r = rangoPreset(clave);
    setDesde(r.desde);
    setHasta(r.hasta);
  }

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const qs = new URLSearchParams({ desde, hasta, agrupacion, limite });
        const resp = await fetch(`${API}/api/reportes?${qs}`, {
          headers: { "x-usuario-id": String(usuario.id) }
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.error || "Error al cargar reportes");
        if (!cancelado) setDatos(json);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => { cancelado = true; };
  }, [desde, hasta, agrupacion, limite, usuario.id]);

  const dataEstados = (datos?.estados || []).map((e) => ({
    clave: e.estado,
    name: ETIQUETAS[e.estado] || e.estado,
    value: e.cantidad,
    porcentaje: e.porcentaje
  }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>📊 Panel de analítica</h2>

      {/* FILTROS */}
      <div style={{ ...estiloCard, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button style={estiloBoton(preset === "7")} onClick={() => elegirPreset("7")}>Últimos 7 días</button>
        <button style={estiloBoton(preset === "30")} onClick={() => elegirPreset("30")}>Últimos 30 días</button>
        <button style={estiloBoton(preset === "mes")} onClick={() => elegirPreset("mes")}>Este mes</button>
        <span style={{ marginLeft: 10 }}>Desde</span>
        <input type="date" value={desde} max={hasta}
          onChange={(e) => { setPreset("custom"); setDesde(e.target.value); }} />
        <span>Hasta</span>
        <input type="date" value={hasta} min={desde}
          onChange={(e) => { setPreset("custom"); setHasta(e.target.value); }} />
        <span style={{ marginLeft: 10 }}>Agrupar por</span>
        <select value={agrupacion} onChange={(e) => setAgrupacion(e.target.value)}>
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
        </select>
        <span>Top</span>
        <select value={limite} onChange={(e) => setLimite(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      {error && <div style={{ ...estiloCard, color: "#b91c1c" }}>⚠️ {error}</div>}
      {cargando && !datos && <div style={estiloCard}>Cargando…</div>}

      {datos && (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            <div style={estiloCard}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Ingresos del periodo</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dinero(datos.ingresos.total)}</div>
            </div>
            <div style={estiloCard}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Pedidos con ingreso</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{datos.ticket.pedidos}</div>
            </div>
            <div style={estiloCard}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Ticket promedio por pedido</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dinero(datos.ticket.porPedido)}</div>
            </div>
            <div style={estiloCard}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Ticket promedio por usuario</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{dinero(datos.ticket.porUsuario)}</div>
            </div>
          </div>

          {/* INGRESOS */}
          <div style={estiloCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Ingresos por {agrupacion === "dia" ? "día" : agrupacion}</strong>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={estiloBoton(tipoGrafica === "barras")} onClick={() => setTipoGrafica("barras")}>Barras</button>
                <button style={estiloBoton(tipoGrafica === "linea")} onClick={() => setTipoGrafica("linea")}>Línea</button>
              </div>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                {tipoGrafica === "barras" ? (
                  <BarChart data={datos.ingresos.serie}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(v) => dinero(v)} />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#3b82f6" />
                  </BarChart>
                ) : (
                  <LineChart data={datos.ingresos.serie}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip formatter={(v) => dinero(v)} />
                    <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* ESTADOS + TOP PRODUCTOS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
            <div style={estiloCard}>
              <strong>Pedidos por estado</strong>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={dataEstados} dataKey="value" nameKey="name" outerRadius={95}
                      label={(e) => `${e.name} ${e.porcentaje}%`}>
                      {dataEstados.map((e) => (
                        <Cell key={e.clave} fill={COLORES[e.clave] || "#9ca3af"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${v} pedidos (${p.payload.porcentaje}%)`, n]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={estiloCard}>
              <strong>🏆 Top {limite} productos más vendidos</strong>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                    <th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.topProductos.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 10, color: "#6b7280" }}>Sin ventas en este rango</td></tr>
                  )}
                  {datos.topProductos.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "6px 0" }}>{i + 1}</td>
                      <td>{p.nombre}</td>
                      <td>{p.unidades}</td>
                      <td>{dinero(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MEJORES CLIENTES */}
          <div style={estiloCard}>
            <strong>👤 Ticket promedio por usuario</strong>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                  <th>Usuario</th><th>Pedidos</th><th>Ticket promedio</th><th>Total gastado</th>
                </tr>
              </thead>
              <tbody>
                {datos.ticket.mejoresClientes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "6px 0" }}>{c.nombre}</td>
                    <td>{c.pedidos}</td>
                    <td>{dinero(c.ticketPromedio)}</td>
                    <td>{dinero(c.totalGastado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardAnalitica;
