import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService, Ticket } from "../services/ticketService";
import "../styles.css";

function Tickets() {

  const [user, setUser] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
    } else {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      cargarTickets(userData);
    }
  }, [navigate]);

  // Refrescar tickets cada 3 segundos para agentes
  useEffect(() => {
    if (user && user.role === "agente") {
      const interval = setInterval(() => {
        if (user) cargarTickets(user);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarTickets = async (currentUser: any) => {
    try {
      let miTickets;
      if (currentUser.role === "agente") {
        miTickets = await ticketService.getAllTickets();
      } else {
        miTickets = await ticketService.getUserTickets(currentUser.id);
      }
      setTickets(miTickets);
    } catch (err: any) {
      console.error("Error cargando tickets:", err.message);
    }
  };

  const crearTicket = async () => {
    if (!titulo || !descripcion) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ticketService.createTicket(titulo, descripcion, "open", user.id);
      alert("Ticket creado exitosamente");
      setTitulo("");
      setDescripcion("");
      cargarTickets(user);
    } catch (err: any) {
      setError(err.message || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (ticketId: number) => {
    const nuevoEstado = estadoSeleccionado[ticketId];
    if (!nuevoEstado) {
      alert("Selecciona un estado");
      return;
    }

    try {
      await ticketService.updateTicket(ticketId, undefined, undefined, nuevoEstado);
      alert("Estado actualizado");
      cargarTickets(user);
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#3b82f6", marginTop: "0" }}>Crear Nuevo Ticket</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>Completa el formulario para crear un nuevo ticket</p>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <input 
            placeholder="Título del ticket"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />

          <textarea 
            placeholder="Descripción detallada"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: "10px", marginBottom: "20px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box", minHeight: "120px" }}
          />

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
      </div>
    );
  }

  // VISTA AGENTE
  if (user.role === "agente") {
    return (
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: "0" }}>Gestionar Tickets</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => cargarTickets(user)}
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
          <p>No hay tickets en el sistema</p>
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
                  <div>
                    <h3 style={{ margin: "0 0 5px 0" }}>{ticket.title}</h3>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>{ticket.description}</p>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>
                    <div><strong>Estado:</strong> {ticket.status}</div>
                    <div><strong>Creado:</strong> {new Date(ticket.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* CAMBIAR ESTADO */}
                <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", marginTop: "10px", borderLeft: "4px solid #f59e0b" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>
                    Cambiar Estado:
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select
                      onChange={(e) => setEstadoSeleccionado({...estadoSeleccionado, [ticket.id]: e.target.value})}
                      defaultValue={ticket.status}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flex: 1
                      }}
                    >
                      <option value="open">Abierto</option>
                      <option value="in_progress">En progreso</option>
                      <option value="closed">Cerrado</option>
                    </select>
                    <button
                      onClick={() => cambiarEstado(ticket.id)}
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
