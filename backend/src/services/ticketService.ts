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
export const updateTicketStatus = async (ticketId: number, newStatus: string, changedBy: number) => {
  // Obtener el estado actual
  const currentTicket = await getTicketById(ticketId);
  if (!currentTicket) {
    throw new Error('Ticket no encontrado');
  }

  const oldStatus = currentTicket.status;

  // Validar transición de estado (HU-6 criterio: flujo de estados)
  if (oldStatus === 'Abierto' && newStatus === 'En progreso') {
    if (!currentTicket.assigned_agent_id) {
      throw new Error('El ticket debe estar asignado a un agente antes de cambiar a "En progreso"');
    }
  } else if (oldStatus === 'En progreso' && newStatus === 'Cerrado') {
    // Permitido
  } else if (newStatus === 'Abierto') {
    throw new Error('No se puede revertir un ticket a estado "Abierto"');
  } else if (oldStatus === 'Cerrado') {
    throw new Error('No se puede cambiar el estado de un ticket cerrado');
  }

  // Actualizar el ticket
  const result = await pool.query(
    'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [newStatus, ticketId]
  );

  // Registrar en historial
  await pool.query(
    'INSERT INTO ticket_history (ticket_id, changed_by, old_status, new_status, change_type) VALUES ($1, $2, $3, $4, $5)',
    [ticketId, changedBy, oldStatus, newStatus, 'status_change']
  );

  return result.rows[0];
};

// Asignar ticket a agente (HU-5)
export const assignTicketToAgent = async (ticketId: number, agentId: number, assignedBy: number) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket no encontrado');
  }

  // Validar que el agente existe y tiene rol 'agente'
  const agent = await pool.query('SELECT id, role FROM users WHERE id = $1', [agentId]);
  if (agent.rows.length === 0 || agent.rows[0].role !== 'agente') {
    throw new Error('El usuario asignado no es un agente válido');
  }

  // Asignar ticket
  const result = await pool.query(
    'UPDATE tickets SET assigned_agent_id = $1, assigned_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
    [agentId, ticketId]
  );

  // Registrar en historial
  await pool.query(
    'INSERT INTO ticket_history (ticket_id, changed_by, change_type, old_status, new_status) VALUES ($1, $2, $3, $4, $5)',
    [ticketId, assignedBy, 'agent_assignment', null, null]
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
    'SELECT th.*, u.username as changed_by_user FROM ticket_history th LEFT JOIN users u ON th.changed_by = u.id WHERE th.ticket_id = $1 ORDER BY th.changed_at ASC',
    [ticketId]
  );
  return result.rows;
};
