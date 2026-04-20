import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../services/ticketService";
import "../styles.css";

function CreateTicket() {

  const [user, setUser] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
    } else {
      setUser(JSON.parse(currentUser));
    }
  }, [navigate]);

  const crearTicket = async () => {
    if (!titulo || !descripcion) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ticketService.createTicket(
        titulo,
        descripcion,
        "open",
        user.id
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
    <div className="main-content">

      <h1>Crear Ticket</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="ticket-form">
        <input 
          placeholder="Título" 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={loading}
        />
        <textarea 
          placeholder="Descripción" 
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={loading}
        />

        <button onClick={crearTicket} disabled={loading}>
          {loading ? "Creando..." : "Crear Ticket"}
        </button>
      </div>

    </div>
  );
}

export default CreateTicket;
