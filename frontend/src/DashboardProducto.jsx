import { useState, useEffect } from "react";

const API = "http://localhost:4000";

function DashboardProducto({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`${API}/productos`);
      const datos = await respuesta.json();
      // Solo los productos de este vendedor
      setProductos(datos.filter((p) => p.vendedorId === usuario.id));
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setImagenUrl("");
    setEditandoId(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      let respuesta;

      if (editandoId === null) {
        respuesta = await fetch(`${API}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            descripcion,
            precio: Number(precio),
            imagenUrl,
            vendedorId: usuario.id,
          }),
        });
      } else {
        respuesta = await fetch(`${API}/productos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            descripcion,
            precio: Number(precio),
            imagenUrl,
          }),
        });
      }

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error || "Error al guardar el producto");
        return;
      }

      if (editandoId === null) {
        alert("Producto registrado. Queda pendiente de aprobación por un administrador.");
      }

      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    }
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || "");
    setPrecio(producto.precio);
    setImagenUrl(producto.imagenUrl || "");
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await fetch(`${API}/productos/${id}`, { method: "DELETE" });
      cargarProductos();
    } catch (error) {
      alert("Error de conexión");
      console.error(error);
    }
  };

  const etiquetaEstado = (estado) => {
    const colores = {
      pendiente: "#f0ad4e",
      aprobado: "#28a745",
      rechazado: "#dc3545",
    };
    return (
      <span style={{ ...estilos.badge, background: colores[estado] || "#999" }}>
        {estado}
      </span>
    );
  };

  return (
    <div>
      <h2 style={estilos.subtitle}>
        {editandoId === null ? "Registrar nuevo producto" : "Editar producto"}
      </h2>

      <form onSubmit={guardarProducto} style={estilos.formRow}>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={estilos.input}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={estilos.input}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          style={estilos.input}
          required
        />
        <input
          type="text"
          placeholder="URL de la imagen"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          style={estilos.input}
        />

        <button type="submit" style={estilos.buttonPrimary}>
          {editandoId === null ? "Registrar" : "Actualizar"}
        </button>
        {editandoId !== null && (
          <button type="button" onClick={limpiarFormulario} style={estilos.buttonSecondary}>
            Cancelar
          </button>
        )}
      </form>

      <hr style={estilos.hr} />

      <h2 style={estilos.subtitle}>Mis productos ({productos.length})</h2>

      {cargando ? (
        <p>Cargando...</p>
      ) : productos.length === 0 ? (
        <p style={estilos.vacio}>Aún no has registrado productos.</p>
      ) : (
        <div style={estilos.grid}>
          {productos.map((p) => (
            <div key={p.id} style={estilos.tarjeta}>
              {p.imagenUrl && (
                <img
                  src={p.imagenUrl}
                  alt={p.nombre}
                  style={estilos.imagen}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/220x140?text=Sin+imagen";
                  }}
                />
              )}
              <h3 style={{ margin: "8px 0 4px" }}>{p.nombre}</h3>
              <p style={{ margin: "0 0 4px", color: "#555", fontSize: "14px" }}>
                {p.descripcion}
              </p>
              <p style={{ margin: "0 0 8px", fontWeight: "bold" }}>${p.precio}</p>
              {etiquetaEstado(p.estado)}
              <div style={{ marginTop: "10px" }}>
                <button style={estilos.btnEditar} onClick={() => editarProducto(p)}>
                  Editar
                </button>
                <button style={estilos.btnEliminar} onClick={() => eliminarProducto(p.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const estilos = {
  subtitle: { color: "#555", marginTop: "10px", marginBottom: "10px" },
  vacio: { color: "#888", fontStyle: "italic" },
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    flex: "1 1 180px",
  },
  buttonPrimary: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  buttonSecondary: {
    padding: "10px 20px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  hr: { margin: "20px 0", border: "none", borderTop: "1px solid #eee" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "15px",
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
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "12px",
    textTransform: "capitalize",
  },
  btnEditar: {
    padding: "6px 12px",
    background: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
    fontSize: "13px",
  },
  btnEliminar: {
    padding: "6px 12px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default DashboardProducto;
