// Script para crear agente2
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createAgente2() {
  try {
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password, role, email) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING RETURNING id, username',
      ['agente2', hashedPassword, 'agente', 'agente2@gmail.com']
    );

    if (result.rowCount > 0) {
      console.log('✅ Usuario agente2 creado');
    } else {
      console.log('ℹ️  Usuario agente2 ya existe');
    }

    console.log('\nUsuario agente2:');
    console.log('Usuario: agente2 | Contraseña: 123456 | Email: agente2@gmail.com');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAgente2();
