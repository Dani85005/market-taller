import { useState, useEffect } from "react";

const API = "http://localhost:4000";

function DashboardAdmin({ usuario }) {
  const [pendientesUsuarios, setPendientesUsuarios] = useState([]);
  const [pendientesProductos, setPendientesProductos] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resPendUsers, resPendProd, resUsers, resProd] = await Promise.all([
        fetch(`${API}/usuarios/pendientes`),
        fetch(`${API}/productos/pendientes`),
        fetch(`${API}/usuarios`),
        fetch(`${API}/productos`),
      ]);

      setPendientesUsuarios(await resPendUsers.json());
      setPendientesProductos(await resPendProd.json());
      setTodosUsuarios(await resUsers.json());
      setTodosProductos(await resProd.json());
    } catch (error) {
      console.error("Error cargando datos del admin:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const aprobarUsuario = async (id, rol) => {
    try {
      const respuesta = await fetch(`${API}/usuarios/${id}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol, estado: "aprobado" }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        alert(datos.error || "Error al aprobar usuario");
        return;
      }

      cargarDatos();
    } catch (error) {
      alert("Error de conexión");
      console.error(error);
    }
  };

  const rechazarUsuario = async (id) => {
    if (!window.confirm("¿Rechazar a este usuario?")) return;
    try {
      await fetch(`${API}/usuarios/${id}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado" }),
      });
      cargarDatos();
    } catch (error) {
      alert("Error de conexión");
      console.error(error);
    }
  };

  const aprobarProducto = async (id) => {
    try {
      await fetch(`${API}/productos/${id}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "aprobado" }),
      });
      cargarDatos();
    } catch (error) {
      alert("Error de conexión");
      console.error(error);
    }
  };

  const rechazarProducto = async (id) => {
    if (!window.confirm("¿Rechazar este producto?")) return;
    try {
      await fetch(`${API}/productos/${id}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado" }),
      });
      cargarDatos();
    } catch (error) {
      alert("Error de conexión");
      console.error(error);
    }
  };

  if (cargando) return <p>Cargando panel de administrador...</p>;

  return (
    <div>
      <h2 style={estilos.subtitle}>Usuarios pendientes de aprobación ({pendientesUsuarios.length})</h2>
      {pendientesUsuarios.length === 0 ? (
        <p style={estilos.vacio}>No hay usuarios pendientes.</p>
      ) : (
        <table style={estilos.table}>
          <thead>
            <tr>
              <th style={estilos.th}>Nombre</th>
              <th style={estilos.th}>Email</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientesUsuarios.map((u) => (
              <tr key={u.id}>
                <td style={estilos.td}>{u.nombre}</td>
                <td style={estilos.td}>{u.email}</td>
                <td style={estilos.td}>
                  <button style={estilos.btnAprobar} onClick={() => aprobarUsuario(u.id, "admin")}>
                    Aprobar como admin
                  </button>
                  <button style={estilos.btnAprobar} onClick={() => aprobarUsuario(u.id, "producto")}>
                    Aprobar como producto
                  </button>
                  <button style={estilos.btnAprobar} onClick={() => aprobarUsuario(u.id, "pedido")}>
                    Aprobar como pedido
                  </button>
                  <button style={estilos.btnRechazar} onClick={() => rechazarUsuario(u.id)}>
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={estilos.hr} />

      <h2 style={estilos.subtitle}>Productos pendientes de aprobación ({pendientesProductos.length})</h2>
      {pendientesProductos.length === 0 ? (
        <p style={estilos.vacio}>No hay productos pendientes.</p>
      ) : (
        <table style={estilos.table}>
          <thead>
            <tr>
              <th style={estilos.th}>Nombre</th>
              <th style={estilos.th}>Precio</th>
              <th style={estilos.th}>Vendedor</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientesProductos.map((p) => (
              <tr key={p.id}>
                <td style={estilos.td}>{p.nombre}</td>
                <td style={estilos.td}>${p.precio}</td>
                <td style={estilos.td}>ID {p.vendedorId}</td>
                <td style={estilos.td}>
                  <button style={estilos.btnAprobar} onClick={() => aprobarProducto(p.id)}>
                    Aprobar
                  </button>
                  <button style={estilos.btnRechazar} onClick={() => rechazarProducto(p.id)}>
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={estilos.hr} />

      <h2 style={estilos.subtitle}>Todos los usuarios ({todosUsuarios.length})</h2>
      <table style={estilos.table}>
        <thead>
          <tr>
            <th style={estilos.th}>Nombre</th>
            <th style={estilos.th}>Email</th>
            <th style={estilos.th}>Rol</th>
            <th style={estilos.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {todosUsuarios.map((u) => (
            <tr key={u.id}>
              <td style={estilos.td}>{u.nombre}</td>
              <td style={estilos.td}>{u.email}</td>
              <td style={estilos.td}>{u.rol || "—"}</td>
              <td style={estilos.td}>{u.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={estilos.hr} />

      <h2 style={estilos.subtitle}>Todos los productos ({todosProductos.length})</h2>
      <table style={estilos.table}>
        <thead>
          <tr>
            <th style={estilos.th}>Nombre</th>
            <th style={estilos.th}>Precio</th>
            <th style={estilos.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {todosProductos.map((p) => (
            <tr key={p.id}>
              <td style={estilos.td}>{p.nombre}</td>
              <td style={estilos.td}>${p.precio}</td>
              <td style={estilos.td}>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const estilos = {
  subtitle: { color: "#555", marginTop: "10px", marginBottom: "10px" },
  vacio: { color: "#888", fontStyle: "italic" },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "10px" },
  th: { border: "1px solid #ddd", padding: "8px", background: "#007bff", color: "#fff", textAlign: "left", fontSize: "13px" },
  td: { border: "1px solid #ddd", padding: "8px", fontSize: "13px" },
  btnAprobar: {
    padding: "5px 8px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
    marginBottom: "3px",
    fontSize: "12px",
  },
  btnRechazar: {
    padding: "5px 8px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  hr: { margin: "20px 0", border: "none", borderTop: "1px solid #eee" },
};

export default DashboardAdmin;
