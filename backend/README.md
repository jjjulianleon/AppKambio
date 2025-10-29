# Kambio Backend API

Backend REST API para la aplicación móvil Kambio - Fitness Financiero.

## Stack Tecnológico

- **Node.js** + **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Expo Push Notifications** - Sistema de notificaciones
- **node-cron** - Programación de nudges

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración de base de datos
│   ├── models/         # Modelos de Sequelize
│   ├── routes/         # Definición de rutas
│   ├── controllers/    # Lógica de negocio
│   ├── middleware/     # Middleware (auth, errores)
│   ├── services/       # Servicios (nudges, progreso)
│   ├── utils/          # Utilidades (notificaciones)
│   ├── app.js          # Configuración de Express
│   └── server.js       # Punto de entrada
├── docker-compose.yml  # PostgreSQL local
├── package.json
└── .env.example
```

## Instalación y Configuración

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://kambio_user:kambio_password@localhost:5432/kambio_db
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
EXPO_ACCESS_TOKEN=tu_expo_token_aqui
```

### 3. Iniciar base de datos (Docker)

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en el puerto 5432.

### 4. Iniciar el servidor

**Modo desarrollo (con hot-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/auth/profile` - Actualizar perfil (requiere auth)
- `POST /api/auth/financial-profile` - Actualizar perfil financiero (requiere auth)

### Metas (Goals)

- `GET /api/goals` - Obtener todas las metas
- `GET /api/goals/:id` - Obtener meta por ID
- `POST /api/goals` - Crear nueva meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta
- `GET /api/goals/:id/progress` - Obtener progreso de meta

### Kambios (Ahorros)

- `GET /api/kambios` - Obtener todos los kambios
- `GET /api/kambios/goal/:goalId` - Obtener kambios por meta
- `POST /api/kambios` - Registrar nuevo kambio
- `DELETE /api/kambios/:id` - Eliminar kambio
- `GET /api/kambios/stats` - Obtener estadísticas

### Transacciones

- `GET /api/transactions` - Obtener transacciones
- `GET /api/transactions/:id` - Obtener transacción por ID
- `POST /api/transactions` - Crear transacción
- `POST /api/transactions/bulk` - Crear múltiples transacciones
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción
- `GET /api/transactions/stats` - Obtener estadísticas

### Categorías de Gastos

- `GET /api/expense-categories` - Obtener categorías
- `GET /api/expense-categories/active` - Obtener categorías activas
- `GET /api/expense-categories/:id` - Obtener categoría por ID
- `POST /api/expense-categories` - Crear categoría
- `POST /api/expense-categories/bulk` - Crear múltiples categorías
- `PUT /api/expense-categories/:id` - Actualizar categoría
- `DELETE /api/expense-categories/:id` - Eliminar categoría

### Notificaciones (Nudges)

- `GET /api/nudges/settings` - Obtener configuración
- `PUT /api/nudges/settings` - Actualizar configuración
- `POST /api/nudges/toggle` - Activar/desactivar
- `POST /api/nudges/push-token` - Registrar token de dispositivo

## Sistema de Nudges

El backend ejecuta automáticamente 3 notificaciones programadas al día:
- **10:00 AM** - Nudge matutino
- **3:00 PM** - Nudge de tarde
- **8:00 PM** - Nudge nocturno

Los mensajes son personalizados con:
- Nombre de la meta del usuario
- Progreso actual
- Categorías de gasto hormiga

## Health Check

Para verificar que el servidor está funcionando:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Kambio API is running",
  "timestamp": "2024-10-28T..."
}
```

## Troubleshooting

### Error: Cannot connect to database

Verifica que PostgreSQL esté corriendo:
```bash
docker ps
```

Si no está corriendo, inicia Docker Compose:
```bash
docker-compose up -d
```

### Error: Port 3000 already in use

Cambia el puerto en `.env`:
```env
PORT=3001
```

### Error: Token inválido

Asegúrate de incluir el header de autorización en tus requests:
```
Authorization: Bearer <tu_token_jwt>
```

## Licencia

MIT
