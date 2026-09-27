import { useState } from "react";
import DashboardAdmin from "./DashboardAdmin";
import DashboardProducto from "./DashboardProducto";
import DashboardPedido from "./DashboardPedido";

const API = "http://localhost:4000";

function App() {
  const [pantalla, setPantalla] = useState("login"); // login | registro
  const [captcha, setCaptcha] = useState(null); // { captchaId, imagenes }
  const [captchaTexto, setCaptchaTexto] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(false);

  const obtenerCaptcha = async () => {
    try {
      const respuesta = await fetch(`${API}/captcha`);
      const datos = await respuesta.json();
      setCaptcha(datos);
      setCaptchaTexto("");
    } catch (error) {
      alert("No se pudo cargar el captcha, revisa que el backend esté corriendo");
      console.error(error);
    }
  };

  const irARegistro = () => {
    setPantalla("registro");
    obtenerCaptcha();
  };

  const irALogin = () => {
    setPantalla("login");
    obtenerCaptcha();
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    if (!captcha) return alert("Espera a que cargue el captcha");
    setCargando(true);

    try {
      const respuesta = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          captchaId: captcha.captchaId,
          captchaTexto,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error || "Error al iniciar sesión");
        obtenerCaptcha();
        return;
      }

      setUsuarioActual(datos);
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (!captcha) return alert("Espera a que cargue el captcha");
    setCargando(true);

    try {
      const respuesta = await fetch(`${API}/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          password: regPassword,
          captchaId: captcha.captchaId,
          captchaTexto,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error || "Error al registrarse");
        obtenerCaptcha();
        return;
      }

      alert("Registro exitoso. Un administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.");
      setRegNombre("");
      setRegEmail("");
      setRegPassword("");
      irALogin();
    } catch (error) {
      alert("Error de conexión con el servidor");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
    irALogin();
  };

  // Si ya hay sesión iniciada, mostramos un dashboard placeholder por ahora
    if (usuarioActual) {
    return (
      <div style={estilos.container}>
        <div style={estilos.cardWide}>
          <h1>Bienvenido, {usuarioActual.nombre}</h1>
          <p>Rol: <b>{usuarioActual.rol}</b></p>
          <button onClick={cerrarSesion} style={estilos.buttonDanger}>
            Cerrar sesión
          </button>
          <hr style={estilos.hr} />

          {usuarioActual.rol === "admin" && <DashboardAdmin usuario={usuarioActual} />}
          {usuarioActual.rol === "producto" && <DashboardProducto usuario={usuarioActual} />}
          {usuarioActual.rol === "pedido" && <DashboardPedido usuario={usuarioActual} />}
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.card}>
        <h1 style={estilos.title}>
          {pantalla === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </h1>

        {pantalla === "login" ? (
          <form onSubmit={manejarLogin} style={estilos.form}>
            <input
              type="email"
              placeholder="Correo"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={estilos.input}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={estilos.input}
              required
            />

            <CaptchaBox
              captcha={captcha}
              captchaTexto={captchaTexto}
              setCaptchaTexto={setCaptchaTexto}
              onRecargar={obtenerCaptcha}
            />

            <button type="submit" style={estilos.buttonPrimary} disabled={cargando}>
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={manejarRegistro} style={estilos.form}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={regNombre}
              onChange={(e) => setRegNombre(e.target.value)}
              style={estilos.input}
              required
            />
            <input
              type="email"
              placeholder="Correo"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              style={estilos.input}
              required
            />
            <input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              style={estilos.input}
              required
            />

            <CaptchaBox
              captcha={captcha}
              captchaTexto={captchaTexto}
              setCaptchaTexto={setCaptchaTexto}
              onRecargar={obtenerCaptcha}
            />

            <button type="submit" style={estilos.buttonPrimary} disabled={cargando}>
              {cargando ? "Registrando..." : "Registrarme"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "15px" }}>
          {pantalla === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button onClick={irARegistro} style={estilos.linkButton}>
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button onClick={irALogin} style={estilos.linkButton}>
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Componente reutilizable para mostrar las 10 imágenes del captcha
function CaptchaBox({ captcha, captchaTexto, setCaptchaTexto, onRecargar }) {
  return (
    <div style={estilos.captchaBox}>
      <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#555" }}>
        Escribe el código que ves abajo:
      </p>
      <div style={estilos.captchaImagenes}>
        {captcha ? (
          captcha.imagenes.map((svg, i) => (
            <span key={i} dangerouslySetInnerHTML={{ __html: svg }} />
          ))
        ) : (
          <span>Cargando captcha...</span>
        )}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <input
          type="text"
          placeholder="Código del captcha"
          value={captchaTexto}
          onChange={(e) => setCaptchaTexto(e.target.value)}
          style={{ ...estilos.input, flex: 1 }}
          required
        />
        <button
          type="button"
          onClick={onRecargar}
          style={estilos.buttonSecondary}
          title="Generar nuevo captcha"
        >
          ↻
        </button>
      </div>
    </div>
  );
}

const estilos = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  cardWide: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "900px",
  },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
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
    padding: "10px 14px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  buttonDanger: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
    padding: 0,
  },
  captchaBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "left",
  },
  captchaImagenes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2px",
    justifyContent: "center",
  },
  hr: { margin: "20px 0", border: "none", borderTop: "1px solid #eee" },
};

export default App;
