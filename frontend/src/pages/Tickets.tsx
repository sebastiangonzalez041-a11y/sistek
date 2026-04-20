import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Tickets() {

  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [tickets, setTickets] = useState([]);
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState({});
  const [estadoSeleccionado, setEstadoSeleccionado] = useState({});

  const navigate = useNavigate();

  // Verificar usuario y cargar tickets
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
      cargarTickets(currentUser);
    }
  }, [navigate]);

  // Escuchar cambios en localStorage para actualizar en tiempo real
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tickets") {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          cargarTickets(currentUser);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  // Para agentes, refrescar tickets cada 3 segundos automáticamente
  useEffect(() => {
    if (user && user.role === "agente") {
      const interval = setInterval(() => {
        cargarTickets(user);
      }, 3000); // Cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [user]);

  // Cargar tickets según el rol
  const cargarTickets = (currentUser) => {
    const todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    if (currentUser.role === "cliente") {
      // Cliente ve solo sus tickets
      const misTickets = todosTickets.filter(t => t.usuario === currentUser.email);
      setTickets(misTickets);
    } else if (currentUser.role === "agente") {
      // Agente solo ve los tickets asignados por el supervisor
      const ticketsAsignados = todosTickets.filter(t => t.agente_asignado === currentUser.email);
      setTickets(ticketsAsignados);
    }
  };

  // Crear ticket (solo clientes)
  const crearTicket = () => {

    if (!titulo || !descripcion || !tipo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];

    const nuevoTicket = {
      id: Date.now(),
      titulo,
      descripcion,
      tipo,
      estado: "Abierto",
      usuario: user.email,
      prioridad: null
    };

    todosTickets.push(nuevoTicket);
    localStorage.setItem("tickets", JSON.stringify(todosTickets));

    alert("Ticket creado exitosamente");

    // Limpiar formulario y recargar
    setTitulo("");
    setDescripcion("");
    setTipo("");
    cargarTickets(user);
  };

  // Asignar prioridad (solo agentes)
  const asignarPrioridad = (ticketId) => {
    const prioridad = prioridadSeleccionada[ticketId];

    if (!prioridad) {
      alert("Selecciona una prioridad");
      return;
    }

    let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = todosTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex !== -1) {
      todosTickets[ticketIndex].prioridad = prioridad;
      localStorage.setItem("tickets", JSON.stringify(todosTickets));
      alert("Prioridad asignada");
      cargarTickets(user);
    }
  };

  // Cambiar estado del ticket (solo agentes)
  const cambiarEstado = (ticketId) => {
    const nuevoEstado = estadoSeleccionado[ticketId];

    if (!nuevoEstado) {
      alert("Selecciona un estado");
      return;
    }

    let todosTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = todosTickets.findIndex(t => t.id === ticketId);

    if (ticketIndex !== -1) {
      const ticket = todosTickets[ticketIndex];

      // Validar que no pueda estar "En progreso" sin estar asignado
      if (nuevoEstado === "En progreso" && !ticket.agente_asignado) {
        alert("No se puede poner en progreso un ticket que no está asignado a un agente");
        return;
      }

      todosTickets[ticketIndex].estado = nuevoEstado;
      localStorage.setItem("tickets", JSON.stringify(todosTickets));
      alert("Estado actualizado");
      cargarTickets(user);
    }
  };

  if (!user) return null;

  // VISTA CLIENTE
  if (user.role === "cliente") {
    return (
      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* BOTÓN VOLVER */}
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

        {/* SECCIÓN: CREAR TICKET */}
        <div style={{ 
          backgroundColor: "white",
          border: "2px solid #3b82f6",
          borderRadius: "8px",
          padding: "25px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#3b82f6", marginTop: "0" }}>Crear Nuevo Ticket</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>Completa el formulario para crear un nuevo ticket de soporte</p>

          <input 
            placeholder="Título del ticket"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />

          <textarea 
            placeholder="Descripción detallada"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box", minHeight: "120px" }}
          />

          <input 
            placeholder="Tipo de problema"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "20px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          />

          <button 
            onClick={crearTicket}
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
            Crear Ticket
          </button>
        </div>
      </div>
    );
  }

  // VISTA AGENTE
  if (user.role === "agente") {
    return (
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER CON BOTÓN */}
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
                border: `3px solid ${ticket.prioridad ? "#10b981" : "#e5e7eb"}`,
                borderRadius: "6px", 
                padding: "15px",
                backgroundColor: ticket.prioridad ? "#f0fdf4" : "#fafafa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0" }}>{ticket.titulo}</h3>
                    <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>{ticket.descripcion}</p>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>
                    <div><strong>Creado por:</strong> {ticket.usuario}</div>
                    <div><strong>Estado:</strong> {ticket.estado}</div>
                  </div>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", marginBottom: "10px" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}><strong>Tipo:</strong> {ticket.tipo}</p>
                  {ticket.fecha_asignacion && (
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#0c4a6e" }}>
                      <strong>📅 Asignado:</strong> {ticket.fecha_asignacion}
                    </p>
                  )}
                </div>

                {/* Radio buttons prioridad */}
                <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "4px", marginBottom: "10px" }}>
                  <label style={{ display: "inline-block", marginRight: "20px", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name={`prioridad-${ticket.id}`}
                      value="Alta"
                      checked={prioridadSeleccionada[ticket.id] === "Alta" || (ticket.prioridad === "Alta" && !prioridadSeleccionada[ticket.id])}
                      onChange={(e) => setPrioridadSeleccionada({...prioridadSeleccionada, [ticket.id]: e.target.value})}
                    />
                    {" "}<span style={{ color: "#dc2626" }}>Alta</span>
                  </label>

                  <label style={{ display: "inline-block", marginRight: "20px", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name={`prioridad-${ticket.id}`}
                      value="Media"
                      checked={prioridadSeleccionada[ticket.id] === "Media" || (ticket.prioridad === "Media" && !prioridadSeleccionada[ticket.id])}
                      onChange={(e) => setPrioridadSeleccionada({...prioridadSeleccionada, [ticket.id]: e.target.value})}
                    />
                    {" "}<span style={{ color: "#f59e0b" }}>Media</span>
                  </label>

                  <label style={{ display: "inline-block", fontSize: "14px" }}>
                    <input
                      type="radio"
                      name={`prioridad-${ticket.id}`}
                      value="Baja"
                      checked={prioridadSeleccionada[ticket.id] === "Baja" || (ticket.prioridad === "Baja" && !prioridadSeleccionada[ticket.id])}
                      onChange={(e) => setPrioridadSeleccionada({...prioridadSeleccionada, [ticket.id]: e.target.value})}
                    />
                    {" "}<span style={{ color: "#10b981" }}>Baja</span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => asignarPrioridad(ticket.id)} 
                    style={{ 
                      backgroundColor: ticket.prioridad ? "#10b981" : "#3b82f6", 
                      color: "white", 
                      padding: "8px 16px", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {ticket.prioridad ? "Actualizar Prioridad" : "Asignar Prioridad"}
                  </button>
                  {ticket.prioridad && (
                    <span style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "white", borderRadius: "4px", fontSize: "14px" }}>
                      ✓ Prioridad: {ticket.prioridad}
                    </span>
                  )}
                </div>

                {/* CAMBIAR ESTADO */}
                <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", marginTop: "10px", borderLeft: "4px solid #f59e0b" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>
                    Cambiar Estado:
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select
                      onChange={(e) => setEstadoSeleccionado({...estadoSeleccionado, [ticket.id]: e.target.value})}
                      defaultValue={ticket.estado}
                      style={{
                        padding: "8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flex: 1
                      }}
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Cerrado">Cerrado</option>
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

  return <h2>Acceso denegado</h2>;
}

export default Tickets;
