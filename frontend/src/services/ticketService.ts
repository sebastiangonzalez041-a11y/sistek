const API_URL = 'http://localhost:4000/api';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export const ticketService = {
  async createTicket(title: string, description: string, status: string, user_id: number): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status, user_id })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  },

  async getAllTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/tickets`);
    if (!response.ok) throw new Error('Error fetching tickets');
    return response.json();
  },

  async getUserTickets(user_id: number): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/tickets/user/${user_id}`);
    if (!response.ok) throw new Error('Error fetching user tickets');
    return response.json();
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${id}`);
    if (!response.ok) throw new Error('Ticket not found');
    return response.json();
  },

  async updateTicket(id: number, title?: string, description?: string, status?: string): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status })
    });
    
    if (!response.ok) throw new Error('Error updating ticket');
    return response.json();
  },

  async deleteTicket(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error deleting ticket');
  }
};
