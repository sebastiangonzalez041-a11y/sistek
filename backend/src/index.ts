// Punto de entrada del backend

import express from 'express';
import pool from './config/database'; // Importar conexión a DB

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json()); // Para parsear JSON

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Ticket System Backend');
});

// Ruta de prueba para DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'DB connected', time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
