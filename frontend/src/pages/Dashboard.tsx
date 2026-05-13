import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService, Ticket } from "../services/ticketService";
import { authService, User } from "../services/authService";
import bienvenidoLogo from "../Bienvenido.png";

import "../styles.css";

function Dashboard() {

  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agentes, setAgentes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // LÓGICA HU-008: Cálculo de Desempeño
  const calcularEstadisticas = () => {
    const cerrados = tickets.filter(t => t.status === 'Cerrado');
    let sumaHoras = 0;
    
    cerrados.forEach(t => {
      const creacion = new Date(t.created_at).getTime();
      const cierre = new Date(t.updated_at).getTime();
      sumaHoras += (cierre - creacion) / (1000 * 60 * 60);
    });

    const tiempoPromedio = cerrados.length > 0 ? (sumaHoras / cerrados.length).toFixed(1) : "0";
    
    const datosGrafica = agentes.map((agente: any) => ({
      nombre: agente.username,
      cantidad: tickets.filter(t => t.assigned_agent_id === agente.id && t.status === 'Cerrado').length
    }));

    return { tiempoPromedio, datosGrafica };
  };

  const stats = calcularEstadisticas();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
    } else {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      cargarDatos(currentUser);
    }
  }, [navigate]);

  const cargarDatos = async (currentUser: any) => {
    try {
      setLoading(true);

      // Cargar tickets según el rol
      if (currentUser.role === "cliente") {
        const miTickets = await ticketService.getMyTickets();
        setTickets(miTickets);
      } else if (currentUser.role === "agente") {
        const miTickets = await ticketService.getMyTickets();
        setTickets(miTickets);
      } else if (currentUser.role === "administrador") {
        const todosTickets = await ticketService.getAllTickets();
        setTickets(todosTickets);

        // Cargar agentes
        const listaAgentes = await authService.getAgents();
        setAgentes(listaAgentes);
      }
    } catch (err: any) {
      console.error("Error cargando datos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">

      {/* 🔵 SIDEBAR */}
      <div className="sidebar">
        <h2>
          <img src={bienvenidoLogo} alt="Sistek Logo" style={{ width: 35, height: 35 }} />
          Sistek
        </h2>

        <button onClick={() => navigate("/dashboard")}>🏠 Inicio</button>

        {user.role === "cliente" && (
          <button onClick={() => navigate("/tickets")}>🎫 Crear Ticket</button>
        )}

        {user.role === "agente" && (
          <button onClick={() => navigate("/tickets")}>📋 Mis Tickets</button>
        )}

        {user.role === "administrador" && (
          <button onClick={() => navigate("/admin-tickets")}>📊 Todos los Tickets</button>
        )}

        <button onClick={logout} className="logout-button">🚪 Cerrar sesión</button>
      </div>

      {/* ⚪ CONTENIDO */}
      <div className="main-content">

        <h1 style={{ textAlign: "center", fontSize: "28px", color: "#1f2937", marginBottom: "30px" }}>Bienvenido, <span style={{ color: "#2563eb", fontWeight: "700" }}>{user.username}</span> 👋</h1>

        <div className="card" style={{ 
          background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
          border: "2px solid #93c5fd",
          textAlign: "center",
          padding: "30px",
          marginBottom: "30px"
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>👤 Usuario</p>
              <p style={{ fontSize: "18px", color: "#1e40af", margin: "0", fontWeight: "700" }}>{user.username}</p>
            </div>
            <div style={{ borderLeft: "2px solid #93c5fd" }}></div>
            <div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>🎭 Rol</p>
              <p style={{ fontSize: "18px", color: "#1e40af", margin: "0", fontWeight: "700", textTransform: "capitalize" }}>
                {user.role === "administrador" ? "👨‍💼 Administrador" : user.role === "agente" ? "🎧 Agente" : "👨‍💻 Cliente"}
              </p>
            </div>
          </div>
        </div>

        {/* ADMIN */}
        {user.role === "administrador" && (
          <>
          <div className="card" style={{ borderLeft: "5px solid #6366f1" }}>
            <h3 style={{ color: "#4f46e5", display: "flex", alignItems: "center", gap: "10px" }}>
              📊 Reporte de Desempeño (HU-008)
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>TIEMPO PROMEDIO</p>
                <h2 style={{ margin: "5px 0" }}>{stats.tiempoPromedio} <span style={{fontSize: "14px"}}>Hrs</span></h2>
              </div>
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>TOTAL CERRADOS</p>
                <h2 style={{ margin: "5px 0" }}>{tickets.filter(t => t.status === 'Cerrado').length}</h2>
              </div>
            </div>

            <div style={{ height: "250px", width: "100%", marginTop: "10px" }}>
              <p style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}>Tickets Cerrados por Agente</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nombre" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
            {/* BOTONES DE ACCIÓN */}
            <div className="card">
              <h3>Gestión</h3>

              <button 
                onClick={() => navigate("/admin-tickets")}
                style={{ 
                  backgroundColor: "#3b82f6", 
                  color: "white", 
                  padding: "10px 16px", 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  marginBottom: "10px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                📋 Ver Todos los Tickets
              </button>
            </div>

            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>TOTAL CREADOS</p>
  <h2 style={{ margin: "5px 0" }}>{tickets.length}</h2>
</div>

            {/* LISTADO DE AGENTES */}
            <div className="card">
              <h3>Agentes Disponibles ({agentes.length})</h3>

              {loading ? (
                <p>Cargando agentes...</p>
              ) : agentes.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
                  No hay agentes registrados aún
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
                  {agentes.map((agente) => (
                    <div
                      key={agente.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "15px" }}>
                          {agente.username}
                        </h4>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        Activo
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESUMEN DE TICKETS */}
            <div className="card">
              <h3>Resumen de Tickets</h3>
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <div>
                  <p><strong>Total:</strong> {tickets.length}</p>
                  <p><strong>Abiertos:</strong> {tickets.filter(t => t.status === 'Abierto').length}</p>
                  <p><strong>En progreso:</strong> {tickets.filter(t => t.status === 'En progreso').length}</p>
                  <p><strong>Cerrados:</strong> {tickets.filter(t => t.status === 'Cerrado').length}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* CLIENTE Y AGENTE */}
        {(user.role === "cliente" || user.role === "agente") && (
          <div className="card" style={{ marginTop: "30px", borderTop: "4px solid #2563eb" }}>
            <div style={{ textAlign: "center", marginBottom: "30px", paddingBottom: "20px", borderBottom: "2px solid #e5e7eb" }}>
              <h2 style={{ margin: "0 0 10px 0", fontSize: "36px", fontWeight: "700", color: "#1f2937", letterSpacing: "-0.5px" }}>
                {user.role === "cliente" ? "🎫 Mis Tickets" : "📋 Mis Tickets"}
              </h2>
              <p style={{ margin: "0", fontSize: "15px", color: "#6b7280", fontWeight: "500" }}>
                {user.role === "cliente" ? "Tickets que has creado" : "Tickets asignados a ti"}
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "16px", color: "#6b7280" }}>⏳ Cargando tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "50px 30px",
                backgroundColor: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                borderRadius: "10px",
                color: "#666",
                border: "2px dashed #22c55e"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
                <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 15px 0", color: "#047857" }}>
                  {user.role === "cliente" ? "No tienes tickets creados aún" : "No hay tickets asignados"}
                </p>
                {user.role === "cliente" && (
                  <button 
                    onClick={() => navigate("/tickets")}
                    style={{ 
                      backgroundColor: "#22c55e", 
                      color: "white", 
                      padding: "12px 24px", 
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#16a34a";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(34, 197, 94, 0.4)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#22c55e";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    ➕ Crear Primer Ticket
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                {tickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets`)}
                    style={{
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.15)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div style={{ position: "absolute", top: "0", left: "0", width: "4px", height: "100%", backgroundColor: ticket.priority === "alto" ? "#ef4444" : ticket.priority === "medio" ? "#f59e0b" : "#22c55e" }}></div>
                    
                    <div style={{ paddingLeft: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <h4 style={{ margin: "0", color: "#1f2937", fontSize: "16px", fontWeight: "700" }}>
                          🔖 {ticket.title}
                        </h4>
                        <span style={{
                          padding: "4px 10px",
                          backgroundColor: ticket.status === "Abierto" ? "#fee2e2" : ticket.status === "En progreso" ? "#fef3c7" : "#dcfce7",
                          color: ticket.status === "Abierto" ? "#991b1b" : ticket.status === "En progreso" ? "#92400e" : "#166534",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          whiteSpace: "nowrap"
                        }}>
                          {ticket.status === "Abierto" ? "🔴" : ticket.status === "En progreso" ? "🟠" : "🟢"} {ticket.status}
                        </span>
                      </div>
                      <p style={{ margin: "0", fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                        Prioridad: <strong>{ticket.priority.toUpperCase()}</strong>
                      </p>
                    </div>
                  </div>
                ))}
                {tickets.length > 5 && (
                  <div style={{ textAlign: "center", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
                    <p style={{ color: "#6b7280", fontSize: "13px", margin: "0" }}>
                      Mostrando 5 de {tickets.length} tickets. <span style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }} onClick={() => navigate("/tickets")}>Ver todos →</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;
