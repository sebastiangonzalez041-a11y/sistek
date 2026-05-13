import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService, Ticket } from "../services/ticketService";
import { authService } from "../services/authService";
import "../styles.css";

function Tickets() {

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medio");
  const [type, setType] = useState("Software");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<{[key: number]: string}>({});
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ESTADOS (Solo para uso del Agente según HU-007)
const [historialSelected, setHistorialSelected] = useState<any[]>([]);
const [showHistorialId, setShowHistorialId] = useState<number | null>(null);
const [loadingHistorial, setLoadingHistorial] = useState(false);

// FUNCIÓN DE CARGA
const verHistorial = async (ticketId: number) => {
  if (showHistorialId === ticketId) {
    setShowHistorialId(null);
    return;
  }
  try {
    setLoadingHistorial(true);
    const data = await ticketService.getTicketHistory(ticketId);
    setHistorialSelected(data);
    setShowHistorialId(ticketId);
  } catch (err) {
    console.error("Error al cargar historial");
  } finally {
    setLoadingHistorial(false);
  }
};

  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
    } else {
      const userData = authService.getCurrentUser();
      setUser(userData);
      cargarTickets();
    }
  }, [navigate]);

  // Refrescar tickets cada 5 segundos
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        cargarTickets();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarTickets = async () => {
    try {
      const miTickets = await ticketService.getMyTickets();
      setTickets(miTickets);
    } catch (err: any) {
      console.error("Error cargando tickets:", err.message);
    }
  };

  const crearTicket = async () => {
    if (!title || !description) {
      setError("Título y descripción son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ticketService.createTicket(title, description, priority, type);
      alert("Ticket creado exitosamente");
      setTitle("");
      setDescription("");
      setPriority("medio");
      setType("Software");
      cargarTickets();
    } catch (err: any) {
      setError(err.message || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (ticketId: number, nuevoEstado: 'Abierto' | 'En progreso' | 'Cerrado') => {
    try {
      await ticketService.updateTicketStatus(ticketId, nuevoEstado, user.id);
      alert("Estado actualizado");
      cargarTickets();
    } catch (err: any) {
      alert("Error actualizando estado: " + err.message);
    }
  };

  const cambiarPrioridad = async (ticketId: number, nuevaPrioridad: string) => {
    try {
      await ticketService.updateTicketPriority(ticketId, nuevaPrioridad);
      alert("Prioridad actualizada");
      setPrioridadSeleccionada(prev => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });
      cargarTickets();
    } catch (err: any) {
      alert("Error actualizando prioridad: " + err.message);
    }
  };

  if (!user) return null;

  // VISTA CLIENTE
  if (user.role === "cliente") {
    return (
      <div style={{ background: "linear-gradient(135deg, #1e5cc8 0%, #2563eb 100%)", minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <button 
            onClick={() => navigate("/dashboard")}
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "30px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.transform = "translateX(-4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            ← Volver
          </button>

          <div style={{ 
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            marginBottom: "30px"
          }}>
            <h2 style={{ color: "#1e5cc8", marginTop: "0", fontSize: "32px", fontWeight: "700", textAlign: "center", marginBottom: "10px" }}>📝 Crear Nuevo Ticket</h2>
            <p style={{ color: "#666", textAlign: "center", marginBottom: "30px", fontSize: "15px", fontWeight: "500" }}>Completa el formulario para crear un nuevo ticket</p>

            {error && <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px", padding: "12px", background: "#fee2e2", borderRadius: "6px", borderLeft: "4px solid #ef4444" }}>{error}</div>}

            <input 
              placeholder="Título del ticket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "14px 16px", 
                marginBottom: "20px", 
                border: "2px solid #e0e0e0", 
                borderRadius: "10px", 
                boxSizing: "border-box",
                fontSize: "15px",
                fontFamily: "'Segoe UI', sans-serif",
                transition: "all 0.3s ease",
                background: "#f8f9fa"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <textarea 
              placeholder="Descripción detallada"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "14px 16px", 
                marginBottom: "20px", 
                border: "2px solid #e0e0e0", 
                borderRadius: "10px", 
                boxSizing: "border-box", 
                minHeight: "120px",
                fontSize: "15px",
                fontFamily: "'Segoe UI', sans-serif",
                transition: "all 0.3s ease",
                background: "#f8f9fa",
                resize: "vertical"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>🎯 Prioridad</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                  style={{ 
                    width: "100%",
                    padding: "12px 14px", 
                    border: "2px solid #e0e0e0", 
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    background: "#f8f9fa",
                    cursor: "pointer",
                    color: "#1a1a1a",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.background = "#f8f9fa";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="bajo">🟢 Baja</option>
                  <option value="medio">🟠 Media</option>
                  <option value="alto">🔴 Alta</option>
                  <option value="urgente">⚫ Urgente</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>🏷️ Tipo</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                  style={{ 
                    width: "100%",
                    padding: "12px 14px", 
                    border: "2px solid #e0e0e0", 
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    background: "#f8f9fa",
                    cursor: "pointer",
                    color: "#1a1a1a",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.background = "#f8f9fa";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="Software">💻 Software</option>
                  <option value="Hardware">🖥️ Hardware</option>
                  <option value="Red">🌐 Red</option>
                  <option value="Acceso">🔐 Acceso</option>
                  <option value="Otro">📌 Otro</option>
                </select>
              </div>
            </div>

            <button 
              onClick={crearTicket}
              disabled={loading}
              style={{ 
                width: "100%",
                backgroundColor: "#2563eb", 
                color: "white", 
                padding: "14px 24px", 
                border: "none", 
                borderRadius: "10px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)"
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #1e5cc8 0%, #1747ab 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#2563eb";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "⏳ Creando..." : "✓ Crear Ticket"}
            </button>
          </div>

          {/* MIS TICKETS */}
          <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", marginTop: "40px", marginBottom: "20px" }}>🎫 Mis Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: "40px 20px", backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "10px" }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
              <p style={{ fontSize: "16px", margin: "0" }}>No tienes tickets creados aún</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {tickets.map((ticket) => (
                <div key={ticket.id} style={{ 
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "10px", 
                  padding: "15px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "16px", fontWeight: "600" }}>🔖 {ticket.title}</h4>
                      <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>{ticket.description}</p>
                      <div style={{ display: "flex", gap: "15px", fontSize: "13px", color: "#666", flexWrap: "wrap" }}>
                        <span>Estado: <strong>{ticket.status}</strong></span>
                        <span>Prioridad: <strong>{ticket.priority}</strong></span>
                        <span>Tipo: <strong>{ticket.type}</strong></span>
                      </div>
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

  // VISTA AGENTE
  if (user.role === "agente") {
    return (
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", background: "linear-gradient(135deg, #1e5cc8 0%, #2563eb 100%)", minHeight: "100vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: "0", color: "white" }}>Mis Tickets Asignados</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => cargarTickets()}
              style={{ 
                backgroundColor: "#10b981", 
                color: "white", 
                padding: "8px 16px", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              🔄 Refrescar
            </button>
            <button 
              onClick={() => navigate("/dashboard")}
              style={{ 
                backgroundColor: "#6b7280", 
                color: "white", 
                padding: "8px 16px", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              ← Volver
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "20px", backgroundColor: "white", borderRadius: "6px" }}>No tienes tickets asignados</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ 
                border: "2px solid #93c5fd",
                borderRadius: "8px", 
                padding: "18px",
                backgroundColor: "#eff6ff"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 5px 0" }}>{ticket.title}</h3>
                    <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>{ticket.description}</p>
                    <div style={{ display: "flex", gap: "15px", fontSize: "13px", color: "#666" }}>
                      <span>Estado: <strong>{ticket.status}</strong></span>
                      <span>Prioridad: <strong>{ticket.priority}</strong></span>
                      <span>Tipo: <strong>{ticket.type}</strong></span>
                      <span>Creado: <strong>{new Date(ticket.created_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                {/* CAMBIAR ESTADO */}
                <div style={{ backgroundColor: "#dbeafe", padding: "14px", borderRadius: "6px", marginTop: "12px", borderLeft: "5px solid #2563eb", border: "1px solid #93c5fd" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e40af", marginBottom: "10px" }}>
                    ✏️ Cambiar Estado:
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select
                      onChange={(e) => setEstadoSeleccionado({...estadoSeleccionado, [ticket.id]: e.target.value})}
                      style={{
                        padding: "10px 12px",
                        border: "2px solid #93c5fd",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flex: 1,
                        backgroundColor: "white",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <option value="">Selecciona un estado...</option>
                      {ticket.status !== "Abierto" && <option value="Abierto">🔴 Abierto</option>}
                      {ticket.status !== "En progreso" && <option value="En progreso">🟠 En progreso</option>}
                      {ticket.status !== "Cerrado" && <option value="Cerrado">🟢 Cerrado</option>}
                    </select>
                    <button
                      onClick={() => {
                        const nuevoEstado = estadoSeleccionado[ticket.id] as 'Abierto' | 'En progreso' | 'Cerrado';
                        if (nuevoEstado) cambiarEstado(ticket.id, nuevoEstado);
                      }}
                      style={{
                        backgroundColor: "#22c55e",
                        color: "white",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#16a34a";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#22c55e";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.3)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      ✓ Actualizar
                    </button>
                  </div>
                </div>

                {/* CAMBIAR PRIORIDAD */}
                <div style={{ backgroundColor: "#fef3c7", padding: "14px", borderRadius: "6px", marginTop: "12px", borderLeft: "5px solid #f59e0b", border: "1px solid #fcd34d" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#92400e", marginBottom: "10px" }}>
                    ⚡ Cambiar Prioridad:
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={prioridadSeleccionada[ticket.id] || ""}
                      onChange={(e) => setPrioridadSeleccionada({...prioridadSeleccionada, [ticket.id]: e.target.value})}
                      style={{
                        padding: "10px 12px",
                        border: "2px solid #fcd34d",
                        borderRadius: "6px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flex: 1,
                        minWidth: "200px",
                        backgroundColor: "white",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <option value="">Selecciona prioridad...</option>
                      <option value="bajo">🟢 Bajo</option>
                      <option value="medio">🟠 Medio</option>
                      <option value="alto">🔴 Alto</option>
                    </select>
                    <button
                      onClick={() => {
                        const nuevaPrioridad = prioridadSeleccionada[ticket.id];
                        if (nuevaPrioridad) cambiarPrioridad(ticket.id, nuevaPrioridad);
                      }}
                      disabled={!prioridadSeleccionada[ticket.id]}
                      style={{
                        backgroundColor: prioridadSeleccionada[ticket.id] ? "#22c55e" : "#d1d5db",
                        color: "white",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: prioridadSeleccionada[ticket.id] ? "pointer" : "not-allowed",
                        fontSize: "13px",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        boxShadow: prioridadSeleccionada[ticket.id] ? "0 2px 8px rgba(34, 197, 94, 0.3)" : "none",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) => {
                        if (prioridadSeleccionada[ticket.id]) {
                          e.currentTarget.style.backgroundColor = "#16a34a";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.4)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (prioridadSeleccionada[ticket.id]) {
                          e.currentTarget.style.backgroundColor = "#22c55e";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(34, 197, 94, 0.3)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      ✓ Actualizar Prioridad
                    </button>
                  </div>
                </div>

              {/* --- SECCIÓN DE HISTORIAL PARA EL AGENTE (HU-007) --- */}
<div style={{ marginTop: "15px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
  <button 
    onClick={() => verHistorial(ticket.id)}
    style={{
      background: "none",
      border: "none",
      color: "#2563eb",
      fontSize: "13px",
      fontWeight: "bold",
      cursor: "pointer",
      padding: "0"
    }}
  >
    {showHistorialId === ticket.id ? "▲ Ocultar Actividad" : "▼ Ver Actividad Reciente"}
  </button>

  {showHistorialId === ticket.id && (
    <div style={{ 
      marginTop: "10px", 
      backgroundColor: "#ffffff", 
      padding: "10px", 
      borderRadius: "4px", 
      border: "1px solid #d1d5db" 
    }}>
      {loadingHistorial ? (
        <p style={{ fontSize: "12px", margin: 0 }}>Cargando...</p>
      ) : historialSelected.length === 0 ? (
        <p style={{ fontSize: "12px", margin: 0, color: "#666" }}>Sin registros.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {historialSelected.map((h, index) => (
            <li key={index} style={{ fontSize: "12px", marginBottom: "5px", borderBottom: "1px solid #f3f4f6" }}>
              <strong>{new Date(h.fecha_registro).toLocaleString()}</strong>: 
              {h.tipo_accion === 'status_change' ? ` Estado -> ${h.valor_nuevo}` : ` Asignado`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</div>

              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Tickets;
