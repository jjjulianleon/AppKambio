# Propuesta Técnica de Implementación - Kambio MVP

## Contexto del Proyecto

Kambio es una aplicación móvil de "Fitness Financiero" para jóvenes ecuatorianos que actúa como coach proactivo de ahorro. El proyecto está documentado en `/Documentos Kambio/Draft_app_Kambio.pdf` y será presentado al Concurso de Diners Club.

**Filosofía Central:** Fitness Financiero, no Autopsia Financiera
- Intervenir ANTES de que ocurran los gastos
- Gamificación del ahorro
- Crear hábitos financieros saludables

## Apariencia

La app debe tener una apariencia minimalista basada en los colores de '/Documentos Kambio/logoKambio.jpg', manteniendo una estetica consistente pero agradable al usuario, que favorezca la UX en todo momento implementando librerias mencionadas mas adelante en el md

## Alcance del MVP

Según el documento PDF, el MVP se enfocará en:

### Funcionalidades Incluidas (MVP)
1. **Onboarding Manual (Simulado)**: Usuario ingresa manualmente sus últimas 10 transacciones
2. **Creación de Una Sola Meta**: Meta de ahorro con nombre, monto e imagen
3. **Sistema de Nudges Basado en Reglas**: 
   - Usuario define 1-2 categorías de "Gasto Hormiga" (ej. Cafés, Comida a domicilio)
   - App envía 2-3 notificaciones push programadas al día
4. **Botón "Hice un Kambio"**: Suma monto predefinido ($4) a la meta
5. **Dashboard Ultra-Simplificado**: Pantalla única con meta, barra de progreso y dinero ahorrado

### Funcionalidades NO Incluidas (Fase 2)
- Conexión bancaria real
- Algoritmos de IA complejos
- Funcionalidades sociales (metas en equipo)
- Múltiples metas o sistema complejo de insignias

## Stack Tecnológico Recomendado

### Frontend: React Native + Expo
**Justificación:**
- Ecosistema maduro para animaciones modernas (Reanimated 2/3, Lottie)
- Mejor experiencia de UI que Flutter para este caso
- Librerías de componentes pre-diseñados más variadas
- Excelente integración con notificaciones push
- Desarrollo más rápido con Expo para MVP

**Librerías Clave:**
- `react-navigation` - Navegación entre pantallas
- `react-native-reanimated` - Animaciones fluidas
- `expo-notifications` - Push notifications
- `lottie-react-native` - Animaciones de celebración
- `react-native-svg` - Gráficos y barras de progreso
- `@react-native-async-storage/async-storage` - Almacenamiento local

### Backend: Node.js + Express
**Justificación:**
- Mismo lenguaje (JavaScript/TypeScript) que el frontend = coherencia
- Ideal para aplicaciones en tiempo real
- Ecosistema robusto para APIs financieras
- JSON nativo = perfecto para REST APIs
- Rápido desarrollo de prototipos

**Librerías Clave:**
- `express` - Framework web
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `pg` - Driver de PostgreSQL
- `sequelize` - ORM para base de datos
- `node-cron` - Programación de notificaciones
- `dotenv` - Gestión de variables de entorno
- `cors` - CORS para desarrollo
- `morgan` - Logging de requests

### Base de Datos: PostgreSQL
**Justificación:**
- Relacional = ideal para datos financieros estructurados
- Transacciones ACID = crítico para operaciones de dinero
- Fácil de ejecutar localmente con Docker
- Migración sencilla a producción (AWS RDS, Railway, etc.)

## Arquitectura del Proyecto

```
kambio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración de PostgreSQL
│   │   ├── models/
│   │   │   ├── User.js              # Modelo de Usuario
│   │   │   ├── Goal.js              # Modelo de Meta de Ahorro
│   │   │   ├── Transaction.js       # Modelo de Transacción Manual
│   │   │   ├── Kambio.js            # Modelo de Kambio (ahorro registrado)
│   │   │   └── ExpenseCategory.js   # Categorías de Gasto Hormiga
│   │   ├── routes/
│   │   │   ├── auth.js              # Registro/Login (Google, Email)
│   │   │   ├── users.js             # Perfil de usuario
│   │   │   ├── goals.js             # CRUD de metas
│   │   │   ├── transactions.js      # Ingreso manual de transacciones
│   │   │   ├── kambios.js           # Registrar Kambios
│   │   │   └── nudges.js            # Configuración de notificaciones
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── goalController.js
│   │   │   ├── transactionController.js
│   │   │   ├── kambioController.js
│   │   │   └── nudgeController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # Verificación JWT
│   │   │   └── errorHandler.js      # Manejo de errores
│   │   ├── services/
│   │   │   ├── nudgeService.js      # Lógica de notificaciones programadas
│   │   │   └── progressService.js   # Cálculo de progreso de metas
│   │   ├── utils/
│   │   │   └── notifications.js     # Envío de push notifications
│   │   ├── app.js                   # Configuración de Express
│   │   └── server.js                # Punto de entrada
│   ├── package.json
│   ├── .env.example                 # Variables de entorno de ejemplo
│   ├── docker-compose.yml           # PostgreSQL local
│   └── README.md
│
└── mobile/
    ├── src/
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── WelcomeScreen.js      # Pantalla de bienvenida
    │   │   │   ├── LoginScreen.js        # Login
    │   │   │   └── RegisterScreen.js     # Registro
    │   │   ├── onboarding/
    │   │   │   ├── ProfileScreen.js      # Cuestionario de bienestar
    │   │   │   ├── TransactionsScreen.js # Ingreso de 10 transacciones
    │   │   │   └── CategoryScreen.js     # Selección de Gasto Hormiga
    │   │   ├── goal/
    │   │   │   ├── CreateGoalScreen.js   # Crear meta
    │   │   │   └── GoalDetailScreen.js   # Detalle de meta
    │   │   ├── dashboard/
    │   │   │   └── DashboardScreen.js    # Dashboard principal
    │   │   └── kambio/
    │   │       └── KambioScreen.js       # Confirmación de Kambio
    │   ├── components/
    │   │   ├── ProgressBar.js            # Barra de progreso animada
    │   │   ├── KambioButton.js           # Botón "Hice un Kambio"
    │   │   ├── GoalCard.js               # Tarjeta de meta
    │   │   ├── TransactionItem.js        # Item de transacción
    │   │   └── CelebrationAnimation.js   # Animación de logro
    │   ├── navigation/
    │   │   └── AppNavigator.js           # Navegación principal
    │   ├── services/
    │   │   ├── api.js                    # Cliente HTTP (axios/fetch)
    │   │   ├── authService.js            # Servicios de autenticación
    │   │   ├── goalService.js            # Servicios de metas
    │   │   └── notificationService.js    # Manejo de notificaciones
    │   ├── utils/
    │   │   ├── constants.js              # Constantes (colores, etc.)
    │   │   └── helpers.js                # Funciones auxiliares
    │   ├── assets/
    │   │   ├── animations/               # Lottie files
    │   │   └── images/                   # Imágenes (logo, iconos)
    │   └── App.js                        # Punto de entrada
    ├── package.json
    ├── app.json                          # Configuración Expo
    ├── babel.config.js
    └── README.md
```

## Modelos de Datos (Base de Datos)

### Tabla: users
```sql
id: UUID (PK)
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255)
full_name: VARCHAR(255)
google_id: VARCHAR(255) UNIQUE (nullable)
apple_id: VARCHAR(255) UNIQUE (nullable)
expo_push_token: VARCHAR(255) (para notificaciones)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Tabla: financial_profiles
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
savings_barrier: TEXT (¿Qué te impide ahorrar?)
motivation: TEXT (¿Qué te motiva?)
spending_personality: VARCHAR(100)
created_at: TIMESTAMP
```

### Tabla: goals
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
name: VARCHAR(255) NOT NULL
target_amount: DECIMAL(10,2) NOT NULL
current_amount: DECIMAL(10,2) DEFAULT 0
image_url: VARCHAR(500)
status: ENUM('active', 'completed', 'cancelled')
created_at: TIMESTAMP
updated_at: TIMESTAMP
completed_at: TIMESTAMP (nullable)
```

### Tabla: expense_categories
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
category_name: VARCHAR(100) (ej. "Cafés", "Comida a domicilio")
default_amount: DECIMAL(10,2) (monto típico, ej. $4)
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
```

### Tabla: transactions (Manual)
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
description: VARCHAR(255)
amount: DECIMAL(10,2)
category: VARCHAR(100)
transaction_date: DATE
created_at: TIMESTAMP
```

### Tabla: kambios
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
goal_id: UUID (FK -> goals.id)
expense_category_id: UUID (FK -> expense_categories.id)
amount: DECIMAL(10,2)
description: TEXT (ej. "Evité comprar café")
created_at: TIMESTAMP
```

### Tabla: nudge_settings
```sql
id: UUID (PK)
user_id: UUID (FK -> users.id)
time_1: TIME (ej. 10:00 AM)
time_2: TIME (ej. 3:00 PM)
time_3: TIME (ej. 8:00 PM)
is_active: BOOLEAN DEFAULT true
```

## Historias de Usuario del MVP (Referencia del PDF)

### HU-01: Configuración de Meta
**Como** nuevo usuario  
**Quiero** crear una meta de ahorro con un nombre y un monto  
**Para** tener un objetivo claro que me motive

**Criterios de Aceptación:**
- Puedo ingresar nombre de la meta (máx. 50 caracteres)
- Puedo ingresar monto objetivo (mínimo $10)
- Puedo seleccionar una imagen de galería o tomar foto
- La meta se guarda y aparece en el dashboard

### HU-02: Definir Gasto Hormiga
**Como** usuario preocupado por mis gastos  
**Quiero** seleccionar la categoría "Cafés" como algo que quiero reducir  
**Para** que la app sepa en qué ayudarme

**Criterios de Aceptación:**
- Puedo seleccionar 1-2 categorías predefinidas
- Puedo definir el monto típico de ese gasto
- La configuración se guarda correctamente

### HU-03: Recibir Nudge
**Como** usuario durante mi jornada diaria  
**Quiero** recibir una notificación que me rete a no gastar en mi "Gasto Hormiga"  
**Para** recordar mi meta de ahorro en el momento justo

**Criterios de Aceptación:**
- Recibo 2-3 notificaciones al día en horarios configurados
- La notificación menciona mi categoría de gasto y mi meta
- Puedo actuar directamente desde la notificación

### HU-04: Acción de Ahorro
**Como** usuario que decidió no gastar  
**Quiero** presionar un botón simple para confirmar mi "Kambio"  
**Para** sentir gratificación inmediata y ver mi progreso

**Criterios de Aceptación:**
- Botón visible y accesible en notificación y app
- Al presionar, se suma el monto a la meta
- Veo animación de celebración
- El cambio se refleja inmediatamente en el dashboard

### HU-05: Ver Progreso
**Como** usuario que está ahorrando  
**Quiero** ver una barra de progreso que se llena con cada "Kambio"  
**Para** mantenerme motivado y ver qué tan cerca estoy de mi meta

**Criterios de Aceptación:**
- Barra de progreso animada y visualmente atractiva
- Muestra monto actual vs. monto objetivo
- Muestra cantidad de Kambios realizados
- Animación especial al completar la meta

## Flujo de Navegación del Usuario (MVP)

```
1. Splash Screen (Logo Kambio)
   ↓
2. Welcome Screen (Intro + Opciones de registro)
   ↓
3. Register/Login Screen
   ↓
4. Profile Questions Screen (5-6 preguntas)
   ↓
5. Manual Transactions Entry (Últimas 10 transacciones)
   ↓
6. Select Expense Category (1-2 categorías de Gasto Hormiga)
   ↓
7. Create Goal Screen (Primera meta)
   ↓
8. Dashboard Screen (Pantalla principal)
   ├── Ver progreso de meta
   ├── Botón "Hice un Kambio"
   └── Lista de Kambios recientes

Notificaciones Push → Acción rápida "Hacer Kambio" → Dashboard actualizado
```

## Sistema de Notificaciones (Nudges)

### Lógica de Programación
```javascript
// Ejemplo de lógica en el backend
const scheduledTimes = ['10:00', '15:00', '20:00']; // Horarios del usuario

const nudgeMessages = [
  {
    time: '10:00',
    message: '☕ ¿Hora del café? ¿O prefieres hacer un Kambio hacia {goalName}?'
  },
  {
    time: '15:00',
    message: '💰 ¡Vas genial! Ya llevas ${currentAmount} de ${targetAmount}. ¿Un Kambio más?'
  },
  {
    time: '20:00',
    message: '🌙 ¿Pediste delivery? Si lo evitaste, ¡registra tu Kambio!'
  }
];
```

### Implementación con node-cron
- Cron jobs que se ejecutan en los horarios configurados
- Envío de notificaciones push vía Expo Push Notifications
- Personalización con nombre de meta y progreso actual

## Configuración de Entorno Local

### Backend (PostgreSQL + Node.js)

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kambio_db
      POSTGRES_USER: kambio_user
      POSTGRES_PASSWORD: kambio_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Variables de entorno (.env):**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://kambio_user:kambio_password@localhost:5432/kambio_db
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
EXPO_ACCESS_TOKEN=tu_expo_token_aqui
```

### Frontend (React Native + Expo)

**Comandos de inicio:**
```bash
cd mobile
npm install
npm start
# Luego escanear QR con Expo Go app
```

## Plan de Implementación Sugerido

### Fase 1: Setup Inicial (Día 1)
- ✅ Crear estructura de carpetas backend y mobile
- ✅ Configurar package.json para ambos proyectos
- ✅ Configurar Docker Compose para PostgreSQL
- ✅ Configurar Sequelize y modelos de base de datos
- ✅ Configurar Expo en el frontend

### Fase 2: Backend Core (Días 2-3)
- ✅ Implementar autenticación (JWT)
- ✅ CRUD de usuarios
- ✅ CRUD de metas
- ✅ CRUD de transacciones manuales
- ✅ CRUD de categorías de gasto
- ✅ CRUD de Kambios
- ✅ Sistema básico de notificaciones programadas

### Fase 3: Frontend Core (Días 4-6)
- ✅ Screens de autenticación
- ✅ Onboarding completo (perfil + transacciones + categorías)
- ✅ Screen de creación de meta
- ✅ Dashboard principal con barra de progreso
- ✅ Botón "Hice un Kambio" con animación
- ✅ Integración con backend (API calls)

### Fase 4: Notificaciones Push (Día 7)
- ✅ Configurar Expo Notifications
- ✅ Registrar tokens de dispositivos
- ✅ Implementar envío de notificaciones desde backend
- ✅ Acciones rápidas desde notificaciones

### Fase 5: Polish y Testing (Días 8-9)
- ✅ Animaciones fluidas con Reanimated
- ✅ Manejo de errores
- ✅ Loading states
- ✅ Validaciones de formularios
- ✅ Testing en emuladores iOS y Android

### Fase 6: Preparación Demo (Día 10)
- ✅ Data seed para demo
- ✅ Video demo de la aplicación
- ✅ Documentación de presentación

## Ventajas Técnicas para el Concurso

1. **Viabilidad Inmediata**: MVP funcional sin dependencias de APIs bancarias
2. **Escalabilidad Clara**: Arquitectura preparada para integración con Cooperativa San Francisco
3. **Experiencia de Usuario Superior**: React Native permite animaciones y transiciones fluidas
4. **Desarrollo Ágil**: Stack moderno permite iteraciones rápidas
5. **Demo Impactante**: Notificaciones push reales funcionando en dispositivos

