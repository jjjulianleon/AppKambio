# Pozo de Ahorro - Backend API

## 📋 Descripción

Sistema de ahorro colaborativo donde los miembros de un grupo pueden solicitar ayuda financiera y contribuir proporcionalmente a las solicitudes de otros miembros.

## 🗄️ Modelos de Base de Datos

### SavingsPool (Pozo de Ahorro)
```sql
- id: UUID (PK)
- name: STRING
- description: TEXT
- is_active: BOOLEAN
- created_at: DATE
- updated_at: DATE
```

### PoolMembership (Membresías)
```sql
- id: UUID (PK)
- pool_id: UUID (FK -> savings_pools)
- user_id: UUID (FK -> users)
- role: ENUM('admin', 'member')
- joined_at: DATE
- is_active: BOOLEAN
- created_at: DATE
- updated_at: DATE
```

### PoolRequest (Solicitudes)
```sql
- id: UUID (PK)
- pool_id: UUID (FK -> savings_pools)
- requester_id: UUID (FK -> users)
- amount: DECIMAL(10,2)
- current_amount: DECIMAL(10,2)
- description: TEXT
- status: ENUM('pending', 'active', 'completed', 'cancelled')
- completed_at: DATE
- created_at: DATE
- updated_at: DATE
```

### PoolContribution (Contribuciones)
```sql
- id: UUID (PK)
- request_id: UUID (FK -> pool_requests)
- contributor_id: UUID (FK -> users)
- amount: DECIMAL(10,2)
- contributed_at: DATE
- created_at: DATE
- updated_at: DATE
```

## 🔌 Endpoints de la API

### GET /api/pools/current
Obtiene todos los datos del pozo actual del usuario.

**Respuesta:**
```json
{
  "success": true,
  "members": [
    {
      "id": "uuid",
      "name": "María García",
      "email": "maria@example.com",
      "totalSavings": 1500.00,
      "photo": null
    }
  ],
  "activeRequests": [
    {
      "id": "uuid",
      "requester": "María García",
      "requesterId": "uuid",
      "amount": 500.00,
      "currentAmount": 320.00,
      "description": "Ayuda para reparación de laptop",
      "contributors": 2,
      "createdAt": "2025-10-27T10:00:00Z"
    }
  ],
  "completedRequests": [],
  "userSavings": 1200.00
}
```

### GET /api/pools/members
Obtiene la lista de miembros del pozo.

### GET /api/pools/requests/active
Obtiene todas las solicitudes activas.

### GET /api/pools/requests/completed
Obtiene el historial de solicitudes completadas.

### GET /api/pools/requests/my
Obtiene las solicitudes del usuario actual.

### POST /api/pools/requests
Crea una nueva solicitud de ayuda.

**Body:**
```json
{
  "amount": 500.00,
  "description": "Ayuda para emergencia médica"
}
```

**Validaciones:**
- Monto mínimo: $50
- Monto máximo: 2x los ahorros actuales del usuario
- Descripción mínima: 10 caracteres

### POST /api/pools/requests/:requestId/contribute
Contribuye a una solicitud.

**Body (opcional):**
```json
{
  "amount": 100.00
}
```

Si no se especifica el monto, se calcula automáticamente de forma proporcional.

**Reglas:**
- No puedes contribuir a tu propia solicitud
- Máximo 50% de tus ahorros actuales
- Solo puedes contribuir una vez por solicitud
- La contribución se deduce proporcionalmente de todas tus metas activas

### GET /api/pools/requests/:requestId/calculate-contribution
Calcula el monto de contribución sugerido para una solicitud.

**Respuesta:**
```json
{
  "success": true,
  "amount": 166.67,
  "maxPossible": 600.00,
  "remaining": 180.00
}
```

## 🔐 Autenticación

Todos los endpoints requieren el header:
```
Authorization: Bearer <token>
```

## 🚀 Inicialización

Al iniciar el servidor:
1. Se crea automáticamente un "Pozo de Ahorro Principal"
2. Todos los usuarios existentes se agregan al pozo
3. El primer usuario se convierte en admin

Al registrar un nuevo usuario:
- Se agrega automáticamente al pozo por defecto como member

## 💰 Lógica de Contribución

### Cálculo Proporcional
```javascript
// Monto restante de la solicitud
remaining = request.amount - request.current_amount

// Contribución proporcional
proportionalAmount = remaining / numberOfMembers

// Máximo desde ahorros (50% del total)
maxFromSavings = userSavings * 0.5

// Contribución final
contributionAmount = min(proportionalAmount, maxFromSavings, remaining)
```

### Deducción de Ahorros
Las contribuciones se deducen proporcionalmente de todas las metas activas:
```javascript
for each goal:
  goalPercentage = goal.current_amount / totalSavings
  deduction = contributionAmount * goalPercentage
  goal.current_amount -= deduction
```

### Completación de Solicitud
Cuando `current_amount >= amount`:
- Status cambia a 'completed'
- Se registra `completed_at`
- El monto completo está disponible para el solicitante

## 📊 Ejemplo de Flujo

### 1. Usuario crea solicitud
```
POST /api/pools/requests
{
  "amount": 600,
  "description": "Emergencia médica"
}
```

### 2. Otros miembros contribuyen
```
POST /api/pools/requests/abc-123/contribute
// Se calcula automáticamente: 600 / 3 miembros = $200 c/u
```

### 3. Sistema deduce de metas
```
Usuario tiene:
- Meta A: $800 (66.67%)
- Meta B: $400 (33.33%)
Total: $1200

Contribución: $200
- De Meta A: $200 * 0.6667 = $133.34
- De Meta B: $200 * 0.3333 = $66.66
```

### 4. Solicitud se completa
```
current_amount = 600
status = 'completed'
completed_at = NOW()
```

## 🛡️ Validaciones y Reglas

### Para Crear Solicitud:
- ✅ Monto >= $50
- ✅ Monto <= 2x ahorros del usuario
- ✅ Descripción >= 10 caracteres
- ✅ Usuario debe estar en un pozo activo

### Para Contribuir:
- ✅ No es tu propia solicitud
- ✅ Solicitud está activa
- ✅ Monto <= 50% de tus ahorros
- ✅ Monto <= monto restante
- ✅ No has contribuido antes
- ✅ Tienes ahorros suficientes

## 🔄 Estados de Solicitud

- **pending**: Creada pero no activa
- **active**: Aceptando contribuciones
- **completed**: Monto completo alcanzado
- **cancelled**: Cancelada por el solicitante

## 📈 Estadísticas Futuras (TODO)

Endpoints planeados:
- `GET /api/pools/statistics` - Estadísticas del pozo
- `GET /api/pools/contributions/my` - Mis contribuciones
- `POST /api/pools/invite` - Invitar nuevos miembros
- `GET /api/pools/balance/available` - Balance disponible

## 🐛 Manejo de Errores

Todos los endpoints devuelven:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en dev)"
}
```

Códigos de estado:
- 200: Éxito
- 201: Creado
- 400: Validación fallida
- 401: No autenticado
- 404: No encontrado
- 500: Error del servidor
