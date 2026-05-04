import pool from '../config/database';

// Obtener todos los tickets
export const getAllTickets = async () => {
  const result = await pool.query(
    'SELECT t.*, u.username as creator FROM tickets t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC'
  );
  return result.rows;
};

// Obtener un ticket por ID
export const getTicketById = async (id: number) => {
  const result = await pool.query(
    'SELECT t.*, u.username as creator, a.username as assigned_agent FROM tickets t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN users a ON t.assigned_agent_id = a.id WHERE t.id = $1',
    [id]
  );
  return result.rows[0];
};

// Obtener tickets de un usuario (cliente)
export const getUserTickets = async (userId: number) => {
  const result = await pool.query(
    'SELECT t.*, u.username as creator, a.username as assigned_agent FROM tickets t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN users a ON t.assigned_agent_id = a.id WHERE t.user_id = $1 ORDER BY t.created_at DESC',
    [userId]
  );
  return result.rows;
};

// Obtener tickets asignados a un agente
export const getAgentTickets = async (agentId: number) => {
  const result = await pool.query(
    'SELECT t.*, u.username as creator, a.username as assigned_agent FROM tickets t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN users a ON t.assigned_agent_id = a.id WHERE t.assigned_agent_id = $1 ORDER BY t.created_at DESC',
    [agentId]
  );
  return result.rows;
};

// Crear ticket (HU-3)
export const createTicket = async (
  title: string,
  description: string,
  priority: string,
  type: string,
  userId: number
) => {
  const result = await pool.query(
    'INSERT INTO tickets (title, description, priority, type, status, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
    [title, description, priority, type, 'Abierto', userId]
  );
  return result.rows[0];
};

// Actualizar estado del ticket (HU-6)
// Actualizar estado del ticket (HU-6)
export const updateTicketStatus = async (ticketId: number, newStatus: string, changedBy: number) => {
  // 1. Obtener el estado actual antes de cambiarlo
  const currentTicket = await getTicketById(ticketId);
  if (!currentTicket) {
    throw new Error('Ticket no encontrado');
  }
  const statusAnterior = currentTicket.status;

  // 2. Actualizar el ticket en la tabla 'tickets'
  const result = await pool.query(
    'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [newStatus, ticketId]
  );

  // 3. Registrar en historial (HU-007)
  await pool.query(
    'INSERT INTO ticket_historia (ticket_id, usuario_accion_id, tipo_accion, valor_anterior, valor_nuevo) VALUES ($1, $2, $3, $4, $5)',
    [ticketId, changedBy, 'status_change', statusAnterior, newStatus]
  );

  return result.rows[0];
};

// Asignar ticket a agente (HU-5)
// Asignar ticket a agente (HU-5) - Versión con Historial (HU-007)
export const assignTicketToAgent = async (ticketId: number, agentId: number, assignedBy: number) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  // 1. Validar que el agente existe y tiene rol 'agente'
  const agent = await pool.query('SELECT id, role FROM users WHERE id = $1', [agentId]);
  if (agent.rows.length === 0 || agent.rows[0].role !== 'agente') {
    throw new Error('El usuario asignado no es un agente válido');
  }

  // 2. Asignar ticket en la tabla 'tickets'
  const result = await pool.query(
    'UPDATE tickets SET assigned_agent_id = $1, assigned_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
    [agentId, ticketId]
  );

  // 3. REGISTRAR EN HISTORIAL (HU-007)
  // Aquí usamos la tabla 'ticket_historia' que creamos en Railway
  await pool.query(
    'INSERT INTO ticket_historia (ticket_id, usuario_accion_id, tipo_accion, valor_anterior, valor_nuevo) VALUES ($1, $2, $3, $4, $5)',
    [ticketId, assignedBy, 'agent_assignment', 'Ninguno', agentId.toString()]
  );

  return result.rows[0];
};

// Eliminar ticket
export const deleteTicket = async (ticketId: number) => {
  const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [ticketId]);
  return result.rows[0];
};

// Obtener historial de cambios (HU-7)
export const getTicketHistory = async (ticketId: number) => {
  const result = await pool.query(
    `SELECT th.*, u.username as nombre_usuario 
     FROM ticket_historia th 
     LEFT JOIN users u ON th.usuario_accion_id = u.id 
     WHERE th.ticket_id = $1 
     ORDER BY th.fecha_registro ASC`,
    [ticketId]
  );
  return result.rows;
};
