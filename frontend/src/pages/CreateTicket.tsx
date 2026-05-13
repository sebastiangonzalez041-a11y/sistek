import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ticketService } from "../services/ticketService";
import "../styles.css";
import "../create-ticket.css";

function CreateTicket() {

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medio");
  const [type, setType] = useState("Software");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
    } else {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
  }, [navigate]);

  const crearTicket = async () => {
    if (!title || !description) {
      setError("Título y descripción son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ticketService.createTicket(
        title,
        description,
        priority,
        type
      );

      alert("Ticket creado exitosamente");
      navigate("/tickets");
    } catch (err: any) {
      setError(err.message || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-container">
        <button className="back-button" onClick={() => navigate("/tickets")}>
          ← Volver
        </button>

        <div className="create-ticket-card">
          <h1 className="create-ticket-title">📝 Crear Nuevo Ticket</h1>
          <p className="create-ticket-subtitle">Completa el formulario para crear un nuevo ticket</p>

          {error && <div className="error-message">{error}</div>}

          <div className="ticket-form">
            <input 
              className="ticket-input"
              placeholder="Título del ticket" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            
            <textarea 
              className="ticket-textarea"
              placeholder="Descripción detallada" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={6}
            />

            <div className="form-row">
              <div className="form-group">
                <label>🎯 Prioridad</label>
                <select 
                  className="ticket-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                >
                  <option value="bajo">🟢 Baja</option>
                  <option value="medio">🟠 Media</option>
                  <option value="alto">🔴 Alta</option>
                  <option value="urgente">⚫ Urgente</option>
                </select>
              </div>

              <div className="form-group">
                <label>🏷️ Tipo</label>
                <select 
                  className="ticket-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
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
              className="create-button" 
              onClick={crearTicket} 
              disabled={loading}
            >
              {loading ? "⏳ Creando..." : "✓ Crear Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
