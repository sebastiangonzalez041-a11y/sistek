import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Dashboard() {

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
      cargarTickets(currentUser);
      if (currentUser.role === "administrador") {
        cargarAgentes();
      }
    }
  }, [navigate]);

  const cargarTickets = (currentUser) => {
    const todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    if (currentUser.role === "cliente") {
      // Cliente ve solo sus tickets
      const misTickets = todosTickets.filter(t => t.usuario === currentUser.email);
      setTickets(misTickets);
    }
  };

  const cargarAgentes = () => {
    const usuarios = JSON.parse(localStorage.getItem("users")) || [];
    const listaAgentes = usuarios.filter(u => u.role === "agente");
    setAgentes(listaAgentes);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const cambiarRol = (rol) => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    user.role = rol;
    localStorage.setItem("currentUser", JSON.stringify(user));
    setUser(user);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">

      {/* 🔵 SIDEBAR */}
      <div className="sidebar">
        <h2>Sistek</h2>

        <button onClick={() => navigate("/dashboard")}>Inicio</button>

        {user.role === "cliente" && (
          <button onClick={() => navigate("/tickets")}>Crear Ticket</button>
        )}

        {user.role === "agente" && (
          <button onClick={() => navigate("/tickets")}>Gestionar Tickets</button>
        )}

        {user.role === "administrador" && (
          <button onClick={() => navigate("/admin-tickets")}>Todos los Tickets</button>
        )}

        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">

        <h1>Bienvenido</h1>

        <div className="card">
          <p><strong>Usuario:</strong> {user.name}</p>
          <p><strong>Rol:</strong> {user.role}</p>
        </div>

        {/* ADMIN */}
        {user.role === "administrador" && (
          <>
            {/* BOTONES DE ACCIÓN */}
            <div className="card">
              <h3>Gestión</h3>

              <button 
                onClick={() => navigate("/admin-tickets")}
                style={{ 
                  backgroundColor: "#3b82f6", 
                  color: "white", 
                  padding: "10px 16px", 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  marginBottom: "10px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                📋 Ver Todos los Tickets
              </button>
            </div>

            {/* LISTADO DE AGENTES */}
            <div className="card">
              <h3>Agentes Disponibles ({agentes.length})</h3>

              {agentes.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  No hay agentes registrados aún
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
                  {agentes.map((agente) => (
                    <div
                      key={agente.email}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "15px" }}>
                          {agente.name}
                        </h4>
                        <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>
                          {agente.email}
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        Activo
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ASIGNAR ROLES */}
            <div className="card">
              <h3>Cambiar tu Rol (Demo)</h3>

              <button onClick={() => cambiarRol("cliente")} style={{ marginRight: "10px" }}>Cliente</button>
              <button onClick={() => cambiarRol("agente")} style={{ marginRight: "10px" }}>Agente</button>
              <button onClick={() => cambiarRol("administrador")}>Administrador</button>
            </div>
          </>
        )}

        {/* CLIENTE */}
        {user.role === "cliente" && (
          <div className="card">
            <h3>Zona Cliente</h3>
            <p>Consulta el estado de tus tickets</p>

            {tickets.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "20px",
                backgroundColor: "#f0fdf4",
                borderRadius: "6px",
                color: "#666"
              }}>
                <p>No tienes tickets creados aún</p>
                <button 
                  onClick={() => navigate("/tickets")}
                  style={{ 
                    backgroundColor: "#3b82f6", 
                    color: "white", 
                    padding: "8px 16px", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: "pointer"
                  }}
                >
                  Crear Ticket
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                {tickets.map((ticket) => (
                  <div key={ticket.id} style={{ 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "6px", 
                    padding: "12px",
                    backgroundColor: "#fafafa"
                  }}>
                    <div style={{ marginBottom: "8px" }}>
                      <h4 style={{ margin: "0 0 4px 0", color: "#1f2937", fontSize: "15px" }}>{ticket.titulo}</h4>
                      <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>{ticket.descripcion}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "13px" }}>
                      <div>
                        <strong style={{ color: "#374151" }}>Tipo:</strong> 
                        <div style={{ color: "#666" }}>{ticket.tipo}</div>
                      </div>
                      <div>
                        <strong style={{ color: "#374151" }}>Prioridad:</strong> 
                        <div style={{ 
                          color: ticket.prioridad ? "#d97706" : "#999",
                          fontWeight: "bold"
                        }}>
                          {ticket.prioridad || "Pendiente"}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: "#374151" }}>Estado:</strong> 
                        <div style={{ 
                          padding: "2px 6px",
                          backgroundColor: "#fef3c7",
                          borderRadius: "4px",
                          display: "inline-block",
                          color: "#92400e",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}>
                          {ticket.estado}
                        </div>
                      </div>
                    </div>
                    {ticket.fecha_asignacion && (
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "#0c4a6e", backgroundColor: "#e0f2fe", padding: "6px", borderRadius: "4px" }}>
                        <strong>📅 Asignado:</strong> {ticket.fecha_asignacion}
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => navigate("/tickets")}
                  style={{ 
                    backgroundColor: "#3b82f6", 
                    color: "white", 
                    padding: "10px 16px", 
                    border: "none", 
                    borderRadius: "4px", 
                    cursor: "pointer",
                    marginTop: "10px"
                  }}
                >
                  Crear Nuevo Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {/* AGENTE */}
        {user.role === "agente" && (
          <div className="card">
            <h3>Zona Agente</h3>
            <p>Gestiona tickets asignados</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
