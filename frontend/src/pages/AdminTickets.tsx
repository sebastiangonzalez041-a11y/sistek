import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function AdminTickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [agentesAsignacion, setAgentesAsignacion] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "administrador") {
      navigate("/dashboard");
    } else {
      setUser(currentUser);
      cargarTickets();
      cargarAgentes();
    }
  }, [navigate]);

  const cargarTickets = () => {
    const todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    setTickets(todosTickets);
  };

  const cargarAgentes = () => {
    const usuarios = JSON.parse(localStorage.getItem("users")) || [];
    const agentes = usuarios.filter(u => u.role === "agente");
    const asignacion = {};
    agentes.forEach(agente => {
      asignacion[agente.email] = agente.name;
    });
    setAgentesAsignacion(asignacion);
  };

  const getAgentes = () => {
    const usuarios = JSON.parse(localStorage.getItem("users")) || [];
    return usuarios.filter(u => u.role === "agente");
  };

  const asignarTicketAlAgente = (ticketId, agentEmail) => {
    if (!agentEmail) {
      alert("Selecciona un agente");
      return;
    }

    let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = todosTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex !== -1) {
      todosTickets[ticketIndex].agente_asignado = agentEmail;
      localStorage.setItem("tickets", JSON.stringify(todosTickets));
      alert("Ticket asignado al agente");
      cargarTickets();
    }
  };

  const cambiarEstadoTicket = (ticketId, nuevoEstado) => {
    let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = todosTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex !== -1) {
      todosTickets[ticketIndex].estado = nuevoEstado;
      localStorage.setItem("tickets", JSON.stringify(todosTickets));
      cargarTickets();
    }
  };

  const eliminarTicket = (ticketId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ticket?")) {
      let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
      todosTickets = todosTickets.filter(t => t.id !== ticketId);
      localStorage.setItem("tickets", JSON.stringify(todosTickets));
      cargarTickets();
      alert("Ticket eliminado");
    }
  };

  const ticketsFiltrados = filtroEstado === "todos" 
    ? tickets 
    : tickets.filter(t => t.estado === filtroEstado);

  const agentes = getAgentes();

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* 🔵 SIDEBAR */}
      <div className="sidebar">
        <h2>Sistek</h2>

        <button onClick={() => navigate("/dashboard")}>Inicio</button>
        <button onClick={() => navigate("/admin-tickets")} style={{ backgroundColor: "#3b82f6", color: "white" }}>Todos los Tickets</button>

        <button onClick={() => {
          localStorage.removeItem("currentUser");
          navigate("/");
        }}>Cerrar sesión</button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">
        <h1>Gestión de Todos los Tickets</h1>

        {/* FILTROS */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}>Filtrar por Estado</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltroEstado("todos")}
              style={{
                backgroundColor: filtroEstado === "todos" ? "#3b82f6" : "#e5e7eb",
                color: filtroEstado === "todos" ? "white" : "#374151",
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
              onClick={() => setFiltroEstado("Resuelto")}
              style={{
                backgroundColor: filtroEstado === "Resuelto" ? "#10b981" : "#e5e7eb",
                color: filtroEstado === "Resuelto" ? "white" : "#374151",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Resuelto ({tickets.filter(t => t.estado === "Resuelto").length})
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
                      <option value="Resuelto">Resuelto</option>
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
