# Guía de Pruebas - Integración Base de Datos

## Configuración Previa

1. **Crear la base de datos:**
   ```bash
   psql -U postgres
   CREATE DATABASE sistek;
   \c sistek
   \i database/schema.sql
   ```

2. **Configurar variables de entorno en `.env`:**
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/sistek
   NODE_ENV=development
   PORT=4000
   ```

3. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

---

## Pruebas por Historia de Usuario

### HU-1: Registro e Inicio de Sesión

#### Registro Exitoso
```bash
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cliente1",
    "password": "password123",
    "role": "cliente"
  }'
```
**Respuesta esperada:** 201 - Usuario registrado exitosamente

#### Registro Duplicado
```bash
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cliente1",
    "password": "password456",
    "role": "cliente"
  }'
```
**Respuesta esperada:** 400 - El usuario ya está registrado

#### Login Exitoso
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cliente1",
    "password": "password123"
  }'
```
**Respuesta esperada:** 200 - Login exitoso con datos del usuario

#### Login Fallido
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cliente1",
    "password": "wrongpassword"
  }'
```
**Respuesta esperada:** 401 - Credenciales incorrectas

---

### HU-2: Gestión de Roles

#### Registrar usuarios con diferentes roles
```bash
# Crear un agente
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agente1",
    "password": "password123",
    "role": "agente"
  }'

# Crear un administrador
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123",
    "role": "administrador"
  }'
```

#### Obtener lista de agentes
```bash
curl -X GET http://localhost:4000/api/users/agents/list
```
**Respuesta esperada:** 200 - Lista de agentes

---

### HU-3: Crear Ticket de Soporte

#### Crear ticket como cliente
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi computadora no enciende",
    "description": "La computadora no enciende desde esta mañana",
    "priority": "alto",
    "type": "Hardware",
    "userId": 1
  }'
```
**Respuesta esperada:** 201 - Ticket creado con estado "Abierto"

#### Validación: Campos requeridos
```bash
curl -X POST http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ticket incompleto"
  }'
```
**Respuesta esperada:** 400 - Campos requeridos faltantes

---

### HU-4: Visualizar Listado de Tickets

#### Cliente visualiza sus propios tickets
```bash
curl -X GET http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userRole": "cliente"
  }'
```
**Respuesta esperada:** 200 - Solo tickets creados por usuario 1

#### Agente visualiza sus tickets asignados
```bash
curl -X GET http://localhost:4000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "userRole": "agente"
  }'
```
**Respuesta esperada:** 200 - Solo tickets asignados al agente

#### Admin visualiza todos los tickets
```bash
curl -X GET http://localhost:4000/api/tickets/all \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "userRole": "administrador"
  }'
```
**Respuesta esperada:** 200 - Todos los tickets del sistema

---

### HU-5: Asignar Ticket a un Agente

#### Administrador asigna ticket a agente
```bash
curl -X PUT http://localhost:4000/api/tickets/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 2,
    "userId": 3,
    "userRole": "administrador"
  }'
```
**Respuesta esperada:** 200 - Ticket asignado correctamente

#### Validación: Solo admin puede asignar
```bash
curl -X PUT http://localhost:4000/api/tickets/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 2,
    "userId": 1,
    "userRole": "cliente"
  }'
```
**Respuesta esperada:** 403 - Solo administradores pueden asignar tickets

---

### HU-6: Cambiar Estado de un Ticket

#### Agente cambia ticket a "En progreso"
```bash
curl -X PUT http://localhost:4000/api/tickets/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "En progreso",
    "userId": 2,
    "userRole": "agente"
  }'
```
**Respuesta esperada:** 200 - Estado actualizado

#### Agente cierra ticket
```bash
curl -X PUT http://localhost:4000/api/tickets/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Cerrado",
    "userId": 2,
    "userRole": "agente"
  }'
```
**Respuesta esperada:** 200 - Ticket cerrado

#### Validación: Estado inválido
```bash
curl -X PUT http://localhost:4000/api/tickets/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "En progreso",
    "userId": 2,
    "userRole": "agente"
  }'
```
**Respuesta esperada:** 400 - No se puede cambiar un ticket cerrado

---

### HU-7: Historial de Cambios del Ticket

#### Obtener historial del ticket
```bash
curl -X GET http://localhost:4000/api/tickets/1/history \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "userRole": "agente"
  }'
```
**Respuesta esperada:** 200 - Lista de eventos (cambios de estado y asignaciones)

---

## Verificación de Base de Datos

### Conectar a PostgreSQL
```bash
psql -U postgres -d sistek
```

### Consultas útiles
```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver todos los tickets
SELECT * FROM tickets;

-- Ver historial de cambios
SELECT * FROM ticket_history;

-- Ver tickets de un usuario específico
SELECT * FROM tickets WHERE user_id = 1;

-- Ver tickets asignados a un agente
SELECT * FROM tickets WHERE assigned_agent_id = 2;
```

---

## Cambios Realizados

✅ **Schema actualizado** - Ahora incluye:
  - `priority` (bajo, medio, alto, urgente)
  - `type` (tipo de problema)
  - `assigned_agent_id` (referencia a agente)
  - `assigned_date` (fecha de asignación)
  - Tabla `ticket_history` para auditoría

✅ **Servicios refactorizados**
  - `userService.ts` - Usa username, password, role con bcrypt
  - `ticketService.ts` - Soporta todas las HU 3-6 con validaciones

✅ **Controladores implementados**
  - `userController.ts` - Autenticación y gestión de usuarios
  - `ticketController.ts` - CRUD de tickets con control de permisos

✅ **Rutas organizadas**
  - `/api/users/register` - Registro
  - `/api/users/login` - Login
  - `/api/users/agents/list` - Listar agentes
  - `/api/tickets` - CRUD de tickets con control de acceso por rol

---

## Notas Importantes

⚠️ **Middleware de Autenticación Pendiente:**
Actualmente los endpoints esperan `userId` y `userRole` en el body. 
Se recomienda implementar un middleware de JWT para:
- Validar token en cada request
- Inyectar userId y userRole en la request automáticamente
- Proteger endpoints

⚠️ **Frontend:**
El frontend debe actualizar las llamadas API para:
- Usar `username` en lugar de `email`
- Incluir `priority` y `type` en tickets
- Usar el nuevo formato de datos
