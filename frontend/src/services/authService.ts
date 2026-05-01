const API_URL = 'http://localhost:4000/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const authService = {
  // Registrar usuario
  async register(username: string, password: string, role: string = 'cliente'): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data: AuthResponse = await response.json();
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Login
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data: AuthResponse = await response.json();
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario autenticado
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obtener token para headers
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error fetching profile');
    return response.json();
  },

  // Obtener todos los usuarios (solo admin)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching users');
    return response.json();
  },

  // Obtener usuario por ID
  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('User not found');
    return response.json();
  },

  // Obtener lista de agentes
  async getAgents(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users/agents/list`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching agents');
    return response.json();
  }
};
