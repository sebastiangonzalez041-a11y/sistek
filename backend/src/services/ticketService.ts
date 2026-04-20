import pool from '../config/database';

// Obtener todos los tickets
export const getAllTickets = async () => {
  const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
  return result.rows;
};

// Obtener tickets de un usuario (cliente)
export const getUserTickets = async (userEmail: string) => {
  const result = await pool.query(
    'SELECT * FROM tickets WHERE usuario = $1 ORDER BY created_at DESC',
    [userEmail]
  );
  return result.rows;
};

// Obtener tickets asignados a un agente
export const getAgentTickets = async (agentEmail: string) => {
  const result = await pool.query(
    'SELECT * FROM tickets WHERE agente_asignado = $1 ORDER BY created_at DESC',
    [agentEmail]
  );
  return result.rows;
};

// Crear ticket
export const createTicket = async (
  id: number,
  titulo: string,
  descripcion: string,
  tipo: string,
  usuario: string
) => {
  const result = await pool.query(
    'INSERT INTO tickets (id, titulo, descripcion, tipo, estado, usuario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, titulo, descripcion, tipo, 'Abierto', usuario]
  );
  return result.rows[0];
};

// Actualizar estado del ticket
export const updateTicketStatus = async (ticketId: number, estado: string) => {
  const result = await pool.query(
    'UPDATE tickets SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [estado, ticketId]
  );
  return result.rows[0];
};

// Asignar ticket a agente
export const assignTicketToAgent = async (ticketId: number, agentEmail: string) => {
  const fechaAsignacion = new Date().toLocaleDateString('es-CO');
  const result = await pool.query(
    'UPDATE tickets SET agente_asignado = $1, fecha_asignacion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [agentEmail, fechaAsignacion, ticketId]
  );
  return result.rows[0];
};

// Actualizar prioridad del ticket
export const updateTicketPriority = async (ticketId: number, prioridad: string) => {
  const result = await pool.query(
    'UPDATE tickets SET prioridad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [prioridad, ticketId]
  );
  return result.rows[0];
};

// Eliminar ticket
export const deleteTicket = async (ticketId: number) => {
  const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [ticketId]);
  return result.rows[0];
};
