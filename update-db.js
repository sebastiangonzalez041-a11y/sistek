const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:DnYYSffEVuWoveehMJOvUwZQZyrkwiRR@shinkansen.proxy.rlwy.net:30401/railway',
  ssl: { rejectUnauthorized: false }
});

async function updateDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    
    const queries = [
      "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS type VARCHAR(100)",
      "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(50)",
      "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_agent_id INTEGER",
      "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP",
      `CREATE TABLE IF NOT EXISTS ticket_history (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('status_change', 'agent_assignment')),
        changed_at TIMESTAMP DEFAULT NOW()
      )`
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
        console.log(`✓ ${query}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`✓ Columna ya existe: ${query}`);
        } else {
          console.error(`✗ Error: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Base de datos actualizada correctamente');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateDatabase();
