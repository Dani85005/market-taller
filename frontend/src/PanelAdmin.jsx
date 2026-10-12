import { useState } from "react";
import DashboardAdmin from "./DashboardAdmin";
import DashboardAnalitica from "./DashboardAnalitica";

const estiloTab = (activa) => ({
  padding: "10px 20px",
  border: "none",
  borderBottom: activa ? "3px solid #3b82f6" : "3px solid transparent",
  background: "transparent",
  color: activa ? "#3b82f6" : "#6b7280",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer"
});

function PanelAdmin({ usuario }) {
  const [vista, setVista] = useState("gestion");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
        <button style={estiloTab(vista === "gestion")} onClick={() => setVista("gestion")}>
          Gestión
        </button>
        <button style={estiloTab(vista === "analitica")} onClick={() => setVista("analitica")}>
          📊 Analítica
        </button>
      </div>

      {vista === "gestion" && <DashboardAdmin usuario={usuario} />}
      {vista === "analitica" && <DashboardAnalitica usuario={usuario} />}
    </div>
  );
}

export default PanelAdmin;
