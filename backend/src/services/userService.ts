import pool from '../config/database';

// Obtener todos los usuarios
export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, email, name, role FROM users');
  return result.rows;
};

// Obtener usuario por email
export const getUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Crear usuario
export const createUser = async (email: string, password: string, name: string, role: string) => {
  const result = await pool.query(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
    [email, password, name, role]
  );
  return result.rows[0];
};

// Obtener agentes
export const getAgents = async () => {
  const result = await pool.query("SELECT id, email, name FROM users WHERE role = 'agente'");
  return result.rows;
};
