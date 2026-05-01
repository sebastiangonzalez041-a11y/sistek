import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService, Ticket } from "../services/ticketService";
import { authService } from "../services/authService";
import "../styles.css";

function AdminTickets() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agentes, setAgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [selectedAgents, setSelectedAgents] = useState<{ [key: number]: string }>({});
  const [loadingAssign, setLoadingAssign] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const userData = authService.getCurrentUser();
    if (userData.role !== "administrador") {
      navigate("/dashboard");
      return;
    }

    setUser(userData);
    cargarDatos();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        cargarDatos();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const todosTickets = await ticketService.getAllTickets();
      setTickets(todosTickets);
      
      const agentesData = await authService.getAgents();
      setAgentes(agentesData);
    } catch (err: any) {
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const asignarTicket = async (ticketId: number, agentId: number) => {
    try {
      setLoadingAssign(ticketId);
      await ticketService.assignTicketToAgent(ticketId, agentId);
      alert("Ticket asignado exitosamente");
      setSelectedAgents(prev => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingAssign(null);
    }
  };

  const logout = () => {
    authService.logout();
    navigate("/");
  };

  const ticketsFiltraos = filtroEstado === "Todos" 
    ? tickets 
    : tickets.filter(t => t.status === filtroEstado);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Sistek</h2>
        <button onClick={() => navigate("/dashboard")}>Inicio</button>
        <button onClick={() => navigate("/admin-tickets")} style={{ backgroundColor: "#3b82f6", color: "white" }}>
          Todos los Tickets
        </button>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="main-content">
        <h1>Gestión de Tickets</h1>

        <div className="card">
          <h3>Filtrar por Estado</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltroEstado("Todos")}
              style={{
                backgroundColor: filtroEstado === "Todos" ? "#3b82f6" : "#e5e7eb",
                color: filtroEstado === "Todos" ? "white" : "#374151",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Todos ({tickets.length})
            </button>
            <button
              onClick={() => setFiltroEstado("Abierto")}
              style={{
                backgroundColor: filtroEstado === "Abierto" ? "#ef4444" : "#e5e7eb",
                color: filtroEstado === "Abierto" ? "white" : "#374151",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Abierto ({tickets.filter(t => t.status === "Abierto").length})
            </button>
            <button
              onClick={() => setFiltroEstado("En progreso")}
              style={{
                backgroundColor: filtroEstado === "En progreso" ? "#f59e0b" : "#e5e7eb",
                color: filtroEstado === "En progreso" ? "white" : "#374151",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              En progreso ({tickets.filter(t => t.status === "En progreso").length})
            </button>
            <button
              onClick={() => setFiltroEstado("Cerrado")}
              style={{
                backgroundColor: filtroEstado === "Cerrado" ? "#10b981" : "#e5e7eb",
                color: filtroEstado === "Cerrado" ? "white" : "#374151",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Cerrado ({tickets.filter(t => t.status === "Cerrado").length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <p>Cargando tickets...</p>
          </div>
        ) : ticketsFiltraos.length === 0 ? (
          <div className="card">
            <p style={{ color: "#6b7280", textAlign: "center" }}>
              No hay tickets para mostrar
            </p>
          </div>
        ) : (
          <div className="card">
            <h3>Tickets ({ticketsFiltraos.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              {ticketsFiltraos.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "#fafafa"
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "16px" }}>
                      #{ticket.id} - {ticket.title}
                    </h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                      {ticket.description}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "12px", fontSize: "13px" }}>
                    <div>
                      <strong style={{ color: "#374151" }}>Estado:</strong>
                      <div style={{
                        padding: "4px 8px",
                        backgroundColor: 
                          ticket.status === "Abierto" ? "#fee2e2" :
                          ticket.status === "En progreso" ? "#fef3c7" :
                          "#dcfce7",
                        color:
                          ticket.status === "Abierto" ? "#991b1b" :
                          ticket.status === "En progreso" ? "#92400e" :
                          "#166534",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginTop: "4px"
                      }}>
                        {ticket.status}
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: "#374151" }}>Prioridad:</strong>
                      <div style={{
                        padding: "4px 8px",
                        backgroundColor: 
                          ticket.priority === "bajo" ? "#e0f2fe" :
                          ticket.priority === "medio" ? "#fef3c7" :
                          ticket.priority === "alto" ? "#fee2e2" :
                          "#f5d4ff",
                        color:
                          ticket.priority === "bajo" ? "#0c4a6e" :
                          ticket.priority === "medio" ? "#92400e" :
                          ticket.priority === "alto" ? "#991b1b" :
                          "#6b21a8",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginTop: "4px",
                        textTransform: "capitalize"
                      }}>
                        {ticket.priority}
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: "#374151" }}>Tipo:</strong>
                      <div style={{
                        padding: "4px 8px",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginTop: "4px"
                      }}>
                        {ticket.type}
                      </div>
                    </div>
                  </div>

                  {ticket.status !== "Cerrado" && (
                    <div style={{ backgroundColor: "#f0f9ff", padding: "12px", borderRadius: "6px", marginBottom: "10px", borderLeft: "4px solid #3b82f6" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e40af", marginBottom: "8px" }}>
                        Asignar a Agente:
                      </label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <select
                          value={selectedAgents[ticket.id] || ""}
                          onChange={(e) => {
                            setSelectedAgents(prev => ({
                              ...prev,
                              [ticket.id]: e.target.value
                            }));
                          }}
                          style={{
                            padding: "8px",
                            border: "1px solid #bfdbfe",
                            borderRadius: "4px",
                            fontSize: "13px",
                            cursor: "pointer",
                            flex: 1,
                            backgroundColor: "white"
                          }}
                        >
                          <option value="">Selecciona un agente...</option>
                          {agentes.map(agente => (
                            <option key={agente.id} value={agente.id}>
                              {agente.username}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const agentId = parseInt(selectedAgents[ticket.id]);
                            if (!isNaN(agentId)) {
                              asignarTicket(ticket.id, agentId);
                            }
                          }}
                          disabled={!selectedAgents[ticket.id] || loadingAssign === ticket.id}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: selectedAgents[ticket.id] ? "#3b82f6" : "#d1d5db",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: selectedAgents[ticket.id] ? "pointer" : "not-allowed",
                            fontSize: "13px",
                            fontWeight: "bold",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {loadingAssign === ticket.id ? "Asignando..." : "Asignar"}
                        </button>
                        {ticket.assigned_agent_id && (
                          <div style={{ fontSize: "12px", color: "#0369a1", whiteSpace: "nowrap" }}>
                            ✓ Asignado
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "12px", color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                    <span>Creado: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Cliente ID: {ticket.user_id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTickets;
