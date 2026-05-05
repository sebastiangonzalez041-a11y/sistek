-- Agregar columna email a tabla users si no existe
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Insertar usuario agente
INSERT INTO users (username, password, role, email) 
VALUES ('agente1', '$2a$10$cUx4eRmXhkG5AA1Wv8kvcui7lf9693.RC2W03QiPgHaHqXpHAKwmu', 'agente', 'agente1@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Insertar usuario administrador
INSERT INTO users (username, password, role, email) 
VALUES ('admin_new', '$2a$10$cUx4eRmXhkG5AA1Wv8kvcui7lf9693.RC2W03QiPgHaHqXpHAKwmu', 'administrador', 'admin@gmail.com')
ON CONFLICT (username) DO NOTHING;
