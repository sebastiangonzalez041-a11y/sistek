import { Request, Response } from 'express';
import * as userService from '../services/userService';

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener agentes
export const getAgents = async (req: Request, res: Response) => {
  try {
    const agents = await userService.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener agentes' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // En producción, usar bcrypt para validar contraseña
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login' });
  }
};

// Registrar usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }

    const newUser = await userService.createUser(email, password, name, role || 'cliente');
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
};
