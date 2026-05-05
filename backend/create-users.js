// Script para agregar columna email y crear usuarios
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupUsers() {
  try {
    // Paso 1: Agregar columna email si no existe
    await pool.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);"
    );
    console.log('✅ Columna email agregada (o ya existe)');

    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Paso 2: Usuario Agente
    const result1 = await pool.query(
      'INSERT INTO users (username, password, role, email) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING RETURNING id, username',
      ['agente1', hashedPassword, 'agente', 'agente1@gmail.com']
    );
    if (result1.rowCount > 0) {
      console.log('✅ Usuario agente1 creado');
    } else {
      console.log('ℹ️  Usuario agente1 ya existe');
    }

    // Paso 3: Usuario Admin
    const result2 = await pool.query(
      'INSERT INTO users (username, password, role, email) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING RETURNING id, username',
      ['admin2', hashedPassword, 'administrador', 'admin@gmail.com']
    );
    if (result2.rowCount > 0) {
      console.log('✅ Usuario admin2 creado');
    } else {
      console.log('ℹ️  Usuario admin2 ya existe');
    }

    console.log('\n✅ Proceso completado');
    console.log('\nNuevos usuarios disponibles:');
    console.log('Usuario: agente1 | Contraseña: 123456 | Email: agente1@gmail.com | Rol: Agente');
    console.log('Usuario: admin2 | Contraseña: 123456 | Email: admin@gmail.com | Rol: Administrador');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupUsers();
