import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Dashboard() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const cambiarRol = (rol) => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    user.role = rol;
    localStorage.setItem("currentUser", JSON.stringify(user));
    setUser(user);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">

      {/* 🔵 SIDEBAR */}
      <div className="sidebar">
        <h2>Sistek</h2>

        <button onClick={() => navigate("/dashboard")}>
          Inicio
        </button>

        {user.role === "cliente" && (
          <button onClick={() => navigate("/tickets")}>
            Crear Ticket
          </button>
        )}

        <button onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">

        <h1>Bienvenido</h1>

        <div className="card">
          <p><strong>Usuario:</strong> {user.name}</p>
          <p><strong>Rol:</strong> {user.role}</p>
        </div>

        {/* ADMIN */}
        {user.role === "administrador" && (
          <div className="card">
            <h3>Asignar Rol</h3>

            <button onClick={() => cambiarRol("cliente")}>Cliente</button>
            <button onClick={() => cambiarRol("agente")}>Agente</button>
            <button onClick={() => cambiarRol("administrador")}>Administrador</button>
          </div>
        )}

        {/* CLIENTE */}
        {user.role === "cliente" && (
  <div className="card">
    <h3>Zona Cliente</h3>
    <p>Puedes crear y consultar tickets</p>

    <button onClick={() => navigate("/tickets")}>
      Ver mis tickets
    </button>
  </div>
)}

        {/* AGENTE */}
        {user.role === "agente" && (
          <div className="card">
            <h3>Zona Agente</h3>
            <p>Gestiona tickets asignados</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;