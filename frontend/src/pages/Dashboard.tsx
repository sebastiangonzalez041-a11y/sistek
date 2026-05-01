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
    if (!authService.isAuthenticated()) {
      navigate("/");
    } else {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      cargarDatos(currentUser);
    }
  }, [navigate]);

  const cargarDatos = async (currentUser: any) => {
    try {
      setLoading(true);

      // Cargar tickets según el rol
      if (currentUser.role === "cliente") {
        const miTickets = await ticketService.getMyTickets();
        setTickets(miTickets);
      } else if (currentUser.role === "agente") {
        const miTickets = await ticketService.getMyTickets();
        setTickets(miTickets);
      } else if (currentUser.role === "administrador") {
        const todosTickets = await ticketService.getAllTickets();
        setTickets(todosTickets);

        // Cargar agentes
        const listaAgentes = await authService.getAgents();
        setAgentes(listaAgentes);
      }
    } catch (err: any) {
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    navigate("/");
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
          <button onClick={() => navigate("/tickets")}>Mis Tickets</button>
        )}

        {user.role === "administrador" && (
          <button onClick={() => navigate("/admin-tickets")}>Todos los Tickets</button>
        )}

        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">

        <h1>Bienvenido, {user.username}</h1>

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

            {/* RESUMEN DE TICKETS */}
            <div className="card">
              <h3>Resumen de Tickets</h3>
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <div>
                  <p><strong>Total:</strong> {tickets.length}</p>
                  <p><strong>Abiertos:</strong> {tickets.filter(t => t.status === 'Abierto').length}</p>
                  <p><strong>En progreso:</strong> {tickets.filter(t => t.status === 'En progreso').length}</p>
                  <p><strong>Cerrados:</strong> {tickets.filter(t => t.status === 'Cerrado').length}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* CLIENTE Y AGENTE */}
        {(user.role === "cliente" || user.role === "agente") && (
          <div className="card">
            <h3>Mis Tickets</h3>
            <p>{user.role === "cliente" ? "Tickets que has creado" : "Tickets asignados a ti"}</p>

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
                <p>{user.role === "cliente" ? "No tienes tickets creados aún" : "No hay tickets asignados"}</p>
                {user.role === "cliente" && (
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
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                {tickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets`)}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                  >
                    <h4 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "14px" }}>
                      {ticket.title}
                    </h4>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#6b7280" }}>
                      Estado: <strong>{ticket.status}</strong> | Prioridad: <strong>{ticket.priority}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;
