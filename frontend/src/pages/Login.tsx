import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Inicializar usuarios demo en localStorage
  useEffect(() => {
    let existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    
    // Usuarios demo predefinidos
    const demoUsers = [
      { email: "agente@sistek.com", password: "123456", name: "Daniel zapata", role: "agente" },
      { email: "agente2@sistek.com", password: "123456", name: "sebas", role: "agente" },
      { email: "supervisor@sistek.com", password: "123456", name: "juan manuel", role: "administrador" }
    ];

    // Agregar usuarios que no existan
    demoUsers.forEach(demoUser => {
      const existe = existingUsers.find(u => u.email === demoUser.email);
      if (!existe) {
        existingUsers.push(demoUser);
      }
    });

    localStorage.setItem("users", JSON.stringify(existingUsers));
  }, []);

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input 
            type="password"
            placeholder="Contraseña"
            value={password}
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