import { useState, useEffect } from "react";

const API = "http://localhost:4000";

const moneda = (n) =>
  Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function DashboardPedido({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

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

  const total = seleccionado ? Number(seleccionado.precio) * Number(cantidad || 0) : 0;

  const abrirCheckout = (producto) => {
    setSeleccionado(producto);
    setCantidad(1);
    setConfirmacion(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmarPedido = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const respuesta = await fetch(`${API}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: seleccionado.id,
          usuarioId: usuario.id,
          cantidad: Number(cantidad),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error || "No se pudo registrar el pedido");
        return;
      }

      setConfirmacion({ pedido: datos, producto: seleccionado });
      setSeleccionado(null);
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p>Cargando catálogo...</p>;

  return (
    <div>
      {confirmacion && (
        <div style={estilos.confirmacion}>
          <h3 style={{ margin: "0 0 8px" }}>
            Pedido #{confirmacion.pedido.id} registrado
          </h3>
          <p style={{ margin: "0 0 4px" }}>
            Estado: <b>Pendiente de pago</b> · Total:{" "}
            <b>{moneda(confirmacion.pedido.total)}</b>
          </p>
          {confirmacion.pedido.notificaciones?.cliente ? (
            <p style={{ margin: 0 }}>
              Te enviamos un correo a <b>{usuario.email}</b> con el desglose y
              los datos bancarios para completar tu pago.
            </p>
          ) : (
            <p style={{ margin: 0, color: "#b45309" }}>
              Tu pedido se guardó, pero no pudimos enviar el correo. Contacta al
              administrador con la referencia PED-{confirmacion.pedido.id}.
            </p>
          )}
        </div>
      )}

      {seleccionado && (
        <form onSubmit={confirmarPedido} style={estilos.checkout}>
          <h2 style={{ margin: "0 0 10px", color: "#333" }}>Checkout</h2>

          <div style={estilos.checkoutFila}>
            {seleccionado.imagenUrl && (
              <img
                src={seleccionado.imagenUrl}
                alt={seleccionado.nombre}
                style={estilos.miniatura}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/90x90?text=Sin+imagen";
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <b>{seleccionado.nombre}</b>
              <p style={{ margin: "4px 0", color: "#555", fontSize: "14px" }}>
                {seleccionado.descripcion}
              </p>
              <span>Precio unitario: {moneda(seleccionado.precio)}</span>
            </div>
          </div>

          <label style={estilos.etiqueta}>
            Cantidad
            <input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={estilos.inputCantidad}
              required
            />
          </label>

          <table style={estilos.resumen}>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td style={{ textAlign: "right" }}>{moneda(total)}</td>
              </tr>
              <tr>
                <td>
                  <b>Total a pagar</b>
                </td>
                <td style={{ textAlign: "right" }}>
                  <b>{moneda(total)}</b>
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: "13px", color: "#666" }}>
            No se cobra en línea: al confirmar, tu pedido queda como{" "}
            <b>Pendiente de pago</b> y recibirás por correo los datos bancarios.
          </p>

          <button type="submit" style={estilos.btnConfirmar} disabled={enviando}>
            {enviando ? "Registrando..." : "Confirmar pedido"}
          </button>
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            style={estilos.btnCancelar}
          >
            Cancelar
          </button>
        </form>
      )}

      <h2 style={estilos.subtitle}>Catálogo de productos ({productos.length})</h2>
      <p style={{ color: "#888", fontSize: "14px", marginTop: "-5px" }}>
        Elige un producto para generar tu pedido.
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
              <p style={estilos.precio}>{moneda(p.precio)}</p>
              <button style={estilos.btnComprar} onClick={() => abrirCheckout(p)}>
                Comprar
              </button>
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
  imagen: { width: "100%", height: "140px", objectFit: "cover", borderRadius: "6px" },
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
  precio: { margin: "0 0 10px", fontWeight: "bold", fontSize: "16px", color: "#007bff" },
  btnComprar: {
    padding: "8px 14px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  checkout: {
    border: "2px solid #007bff",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    background: "#f8fbff",
  },
  checkoutFila: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" },
  miniatura: { width: "90px", height: "90px", objectFit: "cover", borderRadius: "6px" },
  etiqueta: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  inputCantidad: {
    width: "80px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  resumen: { width: "100%", marginBottom: "10px", borderTop: "1px solid #ddd" },
  btnConfirmar: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "8px",
  },
  btnCancelar: {
    padding: "10px 20px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  confirmacion: {
    background: "#ecfdf5",
    border: "1px solid #34d399",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "16px",
  },
};

export default DashboardPedido;
