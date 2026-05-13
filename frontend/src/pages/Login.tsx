import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles.css";
import bienvenidoLogo from "../Bienvenido.png";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya hay un usuario logueado, ir al dashboard
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* IZQUIERDA */}
      <div className="left-panel">
        <div className="left-panel-content">
          <h1>Bienvenido</h1>
          <div className="logo-container">
            <img src={bienvenidoLogo} alt="Sistek Logo" className="logo" />
          </div>
          <p className="tagline">Gestiona tus tickets fácilmente</p>
        </div>
      </div>

      {/* DERECHA */}
      <div className="right-panel">
        <div className="form-box">
          <h2>Iniciar sesión</h2>

          {error && <p className="error-message">{error}</p>}

          <input 
            placeholder="usuario@sistek.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="form-input"
          />

          <input 
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="form-input"
          />

          <button onClick={handleLogin} disabled={loading} className="login-button">
            {loading ? "Cargando..." : "Ingresar"}
          </button>

          <p className="link">
            ¿No tienes cuenta?{" "}
            <span onClick={() => navigate("/register")} className="register-link">
              Regístrate
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;