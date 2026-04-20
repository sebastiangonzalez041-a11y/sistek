import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService, Ticket } from "../services/ticketService";
import { authService } from "../services/authService";
import "../styles.css";

function Dashboard() {

  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
    } else {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      cargarDatos(userData);
    }
  }, [navigate]);

  const cargarDatos = async (currentUser: any) => {
    try {
      setLoading(true);

      // Cargar tickets del usuario
      if (currentUser.role !== "administrador") {
        const miTickets = await ticketService.getUserTickets(currentUser.id);
        setTickets(miTickets);
      }

      // Cargar agentes si es administrador
      if (currentUser.role === "administrador") {
        const usuarios = await authService.getUsers();
        const listaAgentes = usuarios.filter(u => u.role === "agente");
        setAgentes(listaAgentes);
      }
    } catch (err: any) {
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">

      {/* 🔵 SIDEBAR */}
      <div className="sidebar">
        <h2>Sistek</h2>

        <button onClick={() => navigate("/dashboard")}>Inicio</button>

        {user.role !== "administrador" && (
          <button onClick={() => navigate("/tickets")}>
            {user.role === "agente" ? "Gestionar Tickets" : "Crear Ticket"}
          </button>
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
          <p><strong>Usuario:</strong> {user.username}</p>
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

              {loading ? (
                <p>Cargando agentes...</p>
              ) : agentes.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  No hay agentes registrados aún
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
                  {agentes.map((agente) => (
                    <div
                      key={agente.id}
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
                          {agente.username}
                        </h4>
                        <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>
                          {agente.role}
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
          </>
        )}

        {/* CLIENTE */}
        {user.role === "cliente" && (
          <div className="card">
            <h3>Zona Cliente</h3>
            <p>Consulta el estado de tus tickets</p>

            {loading ? (
              <p>Cargando tickets...</p>
            ) : tickets.length === 0 ? (
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
                      <h4 style={{ margin: "0 0 4px 0", color: "#1f2937", fontSize: "15px" }}>{ticket.title}</h4>
                      <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>{ticket.description}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
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
                          {ticket.status}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: "#374151" }}>Creado:</strong> 
                        <div style={{ color: "#666" }}>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
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
