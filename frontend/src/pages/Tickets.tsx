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

  if (!user) return null;

  // VISTA CLIENTE
  if (user.role === "cliente") {
    return (
      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        
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
            fontWeight: "bold",
            marginBottom: "20px"
          }}
        >
          ← Volver
        </button>

        <div style={{ 
          backgroundColor: "white",
          border: "2px solid #3b82f6",
          borderRadius: "8px",
          padding: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "30px"
        }}>
          <h2 style={{ color: "#3b82f6", marginTop: "0" }}>Crear Nuevo Ticket</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>Completa el formulario para crear un nuevo ticket</p>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <input 
            placeholder="Título del ticket"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />

          <textarea 
            placeholder="Descripción detallada"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box", minHeight: "120px" }}
          />

          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
              style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value="bajo">Prioridad Baja</option>
              <option value="medio">Prioridad Media</option>
              <option value="alto">Prioridad Alta</option>
              <option value="urgente">Urgente</option>
            </select>

            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Red">Red</option>
              <option value="Acceso">Acceso</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <button 
            onClick={crearTicket}
            disabled={loading}
            style={{ 
              backgroundColor: "#3b82f6", 
              color: "white", 
              padding: "12px 24px", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {loading ? "Creando..." : "Crear Ticket"}
          </button>
        </div>

        {/* MIS TICKETS */}
        <h3>Mis Tickets ({tickets.length})</h3>
        {tickets.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No tienes tickets creados aún</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ 
                border: "1px solid #e5e7eb",
                borderRadius: "6px", 
                padding: "15px",
                backgroundColor: "#fafafa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1f2937" }}>{ticket.title}</h4>
                    <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>{ticket.description}</p>
                    <div style={{ display: "flex", gap: "15px", fontSize: "13px", color: "#666" }}>
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
    );
  }

  // VISTA AGENTE
  if (user.role === "agente") {
    return (
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: "0" }}>Mis Tickets Asignados</h1>
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
          <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No tienes tickets asignados</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ 
                border: "3px solid #e5e7eb",
                borderRadius: "6px", 
                padding: "15px",
                backgroundColor: "#fafafa"
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
                <div style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "4px", marginTop: "10px", borderLeft: "4px solid #f59e0b" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>
                    Cambiar Estado:
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select
                      onChange={(e) => setEstadoSeleccionado({...estadoSeleccionado, [ticket.id]: e.target.value})}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flex: 1
                      }}
                    >
                      <option value="">Selecciona un estado...</option>
                      {ticket.status !== "Abierto" && <option value="Abierto">Abierto</option>}
                      {ticket.status !== "En progreso" && <option value="En progreso">En progreso</option>}
                      {ticket.status !== "Cerrado" && <option value="Cerrado">Cerrado</option>}
                    </select>
                    <button
                      onClick={() => {
                        const nuevoEstado = estadoSeleccionado[ticket.id] as 'Abierto' | 'En progreso' | 'Cerrado';
                        if (nuevoEstado) cambiarEstado(ticket.id, nuevoEstado);
                      }}
                      style={{
                        backgroundColor: "#f59e0b",
                        color: "white",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "bold"
                      }}
                    >
                      Actualizar
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
