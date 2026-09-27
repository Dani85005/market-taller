import { useState, useEffect } from "react";

const API = "http://localhost:4000";

function DashboardPedido({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`${API}/productos/aprobados`);
      const datos = await respuesta.json();
      setProductos(datos);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  if (cargando) return <p>Cargando catálogo...</p>;

  return (
    <div>
      <h2 style={estilos.subtitle}>Catálogo de productos ({productos.length})</h2>
      <p style={{ color: "#888", fontSize: "14px", marginTop: "-5px" }}>
        Aquí puedes consultar los productos disponibles con sus características y precio.
      </p>

      {productos.length === 0 ? (
        <p style={estilos.vacio}>No hay productos disponibles por el momento.</p>
      ) : (
        <div style={estilos.grid}>
          {productos.map((p) => (
            <div key={p.id} style={estilos.tarjeta}>
              {p.imagenUrl ? (
                <img
                  src={p.imagenUrl}
                  alt={p.nombre}
                  style={estilos.imagen}
                  onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/220x140?text=Sin+imagen";
                }}
                />
              ) : (
                <div style={estilos.sinImagen}>Sin imagen</div>
              )}
              <h3 style={{ margin: "8px 0 4px" }}>{p.nombre}</h3>
              <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>
                {p.descripcion || "Sin descripción"}
              </p>
              <p style={estilos.precio}>${p.precio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const estilos = {
  subtitle: { color: "#555", marginTop: "10px", marginBottom: "5px" },
  vacio: { color: "#888", fontStyle: "italic" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },
  tarjeta: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  imagen: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  sinImagen: {
    width: "100%",
    height: "140px",
    background: "#f0f0f0",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "13px",
  },
  precio: {
    margin: 0,
    fontWeight: "bold",
    fontSize: "16px",
    color: "#007bff",
  },
};

export default DashboardPedido;
