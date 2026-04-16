import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = () => {

    if (!name || !email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!validarEmail(email)) {
      alert("Ingresa un correo válido");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const existe = users.find(u => u.email === email);

    if (existe) {
      alert("El correo ya está registrado");
      return;
    }

    users.push({
      name,
      email,
      password,
      role: "cliente"
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registro exitoso");
    navigate("/");
  };

  return (
    <div className="auth-container">

      {/* IZQUIERDA */}
      <div className="left-panel">
        <h1>Únete a Sistek</h1>
        <p>Crea tu cuenta y gestiona tickets</p>
      </div>

      {/* DERECHA */}
      <div className="right-panel">
        <div className="form-box">

          <h2>Registro</h2>

          <input placeholder="Nombre" onChange={(e) => setName(e.target.value)} />

          <input placeholder="Correo" onChange={(e) => setEmail(e.target.value)} />

          <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleRegister}>Registrarse</button>

          <p className="link">
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => navigate("/")} style={{color:"#2563eb", cursor:"pointer"}}>
              Inicia sesión
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;