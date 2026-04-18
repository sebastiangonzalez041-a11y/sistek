import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = () => {

    if (!email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!validarEmail(email)) {
      alert("Ingresa un correo electrónico válido");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="auth-container">

      {/* IZQUIERDA */}
      <div className="left-panel">
        <h1>Bienvenido a Sistek</h1>
        <p>Gestiona tus tickets fácilmente</p>
      </div>

      {/* DERECHA */}
      <div className="right-panel">
        <div className="form-box">
          <h2>Iniciar sesión</h2>

          <input 
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input 
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Ingresar</button>

          <p className="link">
            ¿No tienes cuenta?{" "}
            <span onClick={() => navigate("/register")} style={{color:"#2563eb", cursor:"pointer"}}>
              Regístrate
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;
