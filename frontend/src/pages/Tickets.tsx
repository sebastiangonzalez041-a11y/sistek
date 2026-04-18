import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Tickets() {

  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [tipo, setTipo] = useState("");

  const navigate = useNavigate();

  // Verificar usuario
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // restricción de rol
  if (user && user.role !== "cliente") {
    return <h2>No tienes permiso para crear tickets</h2>;
  }

  //Crear ticket
  const crearTicket = () => {

    if (!titulo || !descripcion || !prioridad || !tipo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

    const nuevoTicket = {
      titulo,
      descripcion,
      prioridad,
      tipo,
      estado: "Abierto",
      usuario: user.email
    };

    tickets.push(nuevoTicket);

    localStorage.setItem("tickets", JSON.stringify(tickets));

    alert("Ticket creado exitosamente");

    navigate("/dashboard");

    // limpiar formulario
    setTitulo("");
    setDescripcion("");
    setPrioridad("");
    setTipo("");
  };

  if (!user) return null;

  return (
    <div className="ticket-form">
      <h1>Mis Tickets</h1>
      <h2 style={{ marginTop: "30px" }}>Historial de Tickets</h2>

      <input 
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <br /><br />

      <textarea 
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <br /><br />

      <input 
        placeholder="Prioridad (Alta, Media, Baja)"
        value={prioridad}
        onChange={(e) => setPrioridad(e.target.value)}
      />

      <br /><br />

      <input 
        placeholder="Tipo de problema"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      />

      <br /><br />

      <button onClick={crearTicket}>
        Crear Ticket
      </button>
    </div>
  );
}

export default Tickets;
