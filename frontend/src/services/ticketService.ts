import { authService } from './authService';

const API_URL = 'http://localhost:4000/api';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  type: string;
  status: 'Abierto' | 'En progreso' | 'Cerrado';
  user_id: number;
  assigned_agent_id: number | null;
  assigned_date: string | null;
  creator?: string;
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  changed_by: number;
  changed_by_user?: string;
  old_status: string | null;
  new_status: string | null;
  change_type: 'status_change' | 'agent_assignment';
  changed_at: string;
}

export const ticketService = {
  // Crear ticket (HU-3)
  async createTicket(
    title: string,
    description: string,
    priority: string,
    type: string
  ): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ title, description, priority, type })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  },

  // Obtener mis tickets (HU-4)
  async getMyTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/tickets`, {
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching tickets');
    return response.json();
  },

  // Obtener todos los tickets (HU-4 - solo admin)
  async getAllTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/tickets/all`, {
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching tickets');
    return response.json();
  },

  // Obtener un ticket por ID
  async getTicket(id: number): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      headers: authService.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ticket not found');
    return response.json();
  },

  // Cambiar estado del ticket (HU-6)
  async updateTicketStatus(id: number, status: 'Abierto' | 'En progreso' | 'Cerrado', changedBy: number): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${id}/status`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ status, changedBy })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  },

  // Asignar ticket a agente (HU-5)
  async assignTicketToAgent(id: number, agentId: number): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${id}/assign`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ agentId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  },

  // Obtener historial del ticket (HU-7)
  async getTicketHistory(id: number): Promise<TicketHistory[]> {
    const response = await fetch(`${API_URL}/tickets/${id}/history`, {
      headers: authService.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error fetching ticket history');
    return response.json();
  },

  // Eliminar ticket (solo admin)
  async deleteTicket(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
  }
};
