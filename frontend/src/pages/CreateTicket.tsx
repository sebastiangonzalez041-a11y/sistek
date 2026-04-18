import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function CreateTicket() {

  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [tipo, setTipo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const crearTicket = () => {

    if (!titulo || !descripcion || !prioridad || !tipo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

    tickets.push({
      titulo,
      descripcion,
      prioridad,
      tipo,
      estado: "Abierto",
      usuario: user.email
    });

    localStorage.setItem("tickets", JSON.stringify(tickets));

    alert("Ticket creado");

    navigate("/tickets"); // 🔥 vuelve a ver tickets
  };

  if (!user) return null;

  return (
    <div className="main-content">

      <h1>Crear Ticket</h1>

      <div className="ticket-form">
        <input placeholder="Título" onChange={(e) => setTitulo(e.target.value)} />
        <textarea placeholder="Descripción" onChange={(e) => setDescripcion(e.target.value)} />
        <input placeholder="Prioridad" onChange={(e) => setPrioridad(e.target.value)} />
        <input placeholder="Tipo" onChange={(e) => setTipo(e.target.value)} />

        <button onClick={crearTicket}>
          Crear Ticket
        </button>
      </div>

    </div>
  );
}

export default CreateTicket;
