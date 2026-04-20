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
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }

    const userData = JSON.parse(currentUser);
    if (userData.role !== "administrador") {
      navigate("/dashboard");
      return;
    }

    setUser(userData);
    cargarDatos();
  }, [navigate]);

  // Refrescar cada 5 segundos
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
      const [todosTickets, usuarios] = await Promise.all([
        ticketService.getAllTickets(),
        authService.getUsers()
      ]);
      setTickets(todosTickets);
      setAgentes(usuarios.filter(u => u.role === "agente"));
    } catch (err: any) {
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (ticketId: number, nuevoEstado: string) => {
    try {
      await ticketService.updateTicket(ticketId, undefined, undefined, nuevoEstado);
      alert("Estado actualizado");
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const eliminarTicket = async (ticketId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este ticket?")) return;

    try {
      await ticketService.deleteTicket(ticketId);
      alert("Ticket eliminado");
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
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
        <button onClick={() => navigate("/admin-tickets")} style={{ backgroundColor: "#3b82f6", color: "white" }}>Todos los Tickets</button>

        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">
        <h1>Gestión de Todos los Tickets</h1>

        {loading ? (
          <p>Cargando tickets...</p>
        ) : tickets.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>No hay tickets en el sistema</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                {/* ENCABEZADO */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "18px" }}>{ticket.title}</h3>
                    <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>ID:</strong> {ticket.id} | <strong>Usuario:</strong> {ticket.user_id}
                    </p>
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    backgroundColor:
                      ticket.status === "open" ? "#fee2e2" :
                      ticket.status === "in_progress" ? "#fef3c7" :
                      "#d1fae5",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color:
                      ticket.status === "open" ? "#991b1b" :
                      ticket.status === "in_progress" ? "#92400e" :
                      "#065f46"
                  }}>
                    {ticket.status === "open" ? "Abierto" : 
                     ticket.status === "in_progress" ? "En progreso" :
                     "Cerrado"}
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                <p style={{
                  backgroundColor: "#f9fafb",
                  padding: "12px",
                  borderRadius: "4px",
                  color: "#374151",
                  margin: "0 0 15px 0",
                  lineHeight: "1.5"
                }}>
                  <strong>Descripción:</strong> {ticket.description}
                </p>

                {/* INFORMACIÓN */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "15px",
                  marginBottom: "15px"
                }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Creado:
                    </label>
                    <div style={{ color: "#666", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "13px" }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Actualizado:
                    </label>
                    <div style={{ color: "#666", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "13px" }}>
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      User ID:
                    </label>
                    <div style={{ color: "#666", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "13px" }}>
                      {ticket.user_id}
                    </div>
                  </div>
                </div>

                {/* CONTROLES */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e5e7eb"
                }}>
                  {/* CAMBIAR ESTADO */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Cambiar Estado:
                    </label>
                    <select
                      onChange={(e) => cambiarEstado(ticket.id, e.target.value)}
                      value={ticket.status}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="open">Abierto</option>
                      <option value="in_progress">En progreso</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>

                  {/* ELIMINAR */}
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                      onClick={() => eliminarTicket(ticket.id)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "bold"
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTickets;
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Abierto ({tickets.filter(t => t.estado === "Abierto").length})
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
              En progreso ({tickets.filter(t => t.estado === "En progreso").length})
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
              Cerrado ({tickets.filter(t => t.estado === "Cerrado").length})
            </button>
          </div>
        </div>

        {/* LISTA DE TICKETS */}
        {ticketsFiltrados.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>No hay tickets con ese filtro</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {ticketsFiltrados.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "box-shadow 0.2s"
                }}
              >
                {/* ENCABEZADO */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "18px" }}>{ticket.titulo}</h3>
                    <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>ID:</strong> {ticket.id} | <strong>Usuario:</strong> {ticket.usuario}
                    </p>
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    backgroundColor:
                      ticket.estado === "Abierto" ? "#fee2e2" :
                      ticket.estado === "En progreso" ? "#fef3c7" :
                      "#d1fae5",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color:
                      ticket.estado === "Abierto" ? "#991b1b" :
                      ticket.estado === "En progreso" ? "#92400e" :
                      "#065f46"
                  }}>
                    {ticket.estado}
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                <p style={{
                  backgroundColor: "#f9fafb",
                  padding: "12px",
                  borderRadius: "4px",
                  color: "#374151",
                  margin: "0 0 15px 0",
                  lineHeight: "1.5"
                }}>
                  <strong>Descripción:</strong> {ticket.descripcion}
                </p>

                {/* GRID DE INFORMACIÓN */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "15px",
                  marginBottom: "15px"
                }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Tipo:
                    </label>
                    <div style={{ color: "#666", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                      {ticket.tipo}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Prioridad:
                    </label>
                    <div style={{
                      color: ticket.prioridad ? "#d97706" : "#999",
                      fontWeight: "bold",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "4px"
                    }}>
                      {ticket.prioridad || "Pendiente"}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Agente Asignado:
                    </label>
                    <div style={{ color: "#666", fontSize: "14px", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                      {ticket.agente_asignado ? agentesAsignacion[ticket.agente_asignado] || "Desconocido" : "Sin asignar"}
                    </div>
                  </div>
                </div>

                {/* FECHA DE ASIGNACIÓN */}
                {ticket.fecha_asignacion && (
                  <div style={{
                    backgroundColor: "#e0f2fe",
                    border: "1px solid #0284c7",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    fontSize: "13px",
                    color: "#0c4a6e"
                  }}>
                    <strong>📅 Fecha de Asignación:</strong> {ticket.fecha_asignacion}
                  </div>
                )}

                {/* CONTROLES */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e5e7eb"
                }}>
                  {/* ASIGNAR AGENTE */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Asignar a:
                    </label>
                    <select
                      onChange={(e) => asignarTicketAlAgente(ticket.id, e.target.value)}
                      defaultValue={ticket.agente_asignado || ""}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="">Seleccionar agente</option>
                      {agentes.map((agente) => (
                        <option key={agente.email} value={agente.email}>
                          {agente.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CAMBIAR ESTADO */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "5px" }}>
                      Estado:
                    </label>
                    <select
                      onChange={(e) => cambiarEstadoTicket(ticket.id, e.target.value)}
                      value={ticket.estado}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>

                  {/* ELIMINAR */}
                  <div>
                    <button
                      onClick={() => eliminarTicket(ticket.id)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "bold",
                        marginTop: "23px"
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTickets;
