# 📋 PLAN DE IMPLEMENTACIÓN - KAMBIO V2

## 🎯 Visión General
Implementación de 4 funcionalidades principales que mejoran la experiencia de usuario, gamificación y gestión colaborativa de gastos.

---

## 📌 FUNCIONALIDAD 1: PANTALLA DE INICIO CON ANIMACIONES

### 1.1 Objetivos
- Modificar la pantalla Welcome más atractiva y dinámica
- Animar el logo (flechas giratorias)
- Implementar fondo con movimiento paraláctico
- Agregar autenticación biométrica (Face ID / Biometría)

### 1.2 Componentes a Crear/Modificar

#### **Archivo: `mobile/src/screens/auth/WelcomeScreen.js` (Rediseño)**

**Estado actual:** Pantalla básica estática

**Cambios necesarios:**
1. Importar librerías de animación:
   - `react-native-reanimated` (ya está instalado)
   - `react-native-svg` (para gráficos vectoriales)
   - `expo-local-authentication` (para Face ID/Huella)

2. Crear componentes:
   - `LogoAnimated`: Logo con flechas que giren continuamente
   - `ParallaxBackground`: Fondo con efecto paraláctico
   - `BiometricButton`: Botón para autenticación biométrica

3. Animaciones:
   ```
   - Rotación infinita del logo (360°, 3-4s)
   - Fondo con desplazamiento paraláctico basado en scroll
   - Fade-in de botones al montar la pantalla
   - Pulse de botón de Face ID
   ```

#### **Archivo: `mobile/src/components/LogoAnimated.js` (Nueva)**

```
Propiedades:
- size: número (default: 80)
- speed: número en ms (default: 3000)
- colors: objeto con colores primarios y secundarios

Retorna:
- SVG animado con 3 flechas girando
- Rotación continua usando useSharedValue
- Sincronización perfecta de animación
```

#### **Archivo: `mobile/src/components/ParallaxBackground.js` (Nueva)**

```
Propiedades:
- scrollOffset: Animated.Value
- gradientStart: color
- gradientEnd: color

Retorna:
- Fondo con capas de formas geométricas
- Movimiento basado en scrollOffset
- Efecto visual de profundidad
```

#### **Archivo: `mobile/src/services/biometricService.js` (Nueva)**

```
Funciones:
- isBiometricAvailable(): Promise<boolean>
- authenticate(): Promise<{success, error}>
- getBiometricType(): Promise<'faceID' | 'touchID' | 'unknown'>

Manejo de errores:
- Dispositivo no soporta biometría
- Usuario cancela autenticación
- Fallos en autenticación
```

### 1.3 Flujo de Implementación

1. **Fase 1: Setup (1-2h)**
   - Instalar dependencias
   - Crear archivos base
   - Configurar valores de animación

2. **Fase 2: Logo animado (1h)**
   - Diseño SVG con 3 flechas
   - Implementar rotación continua
   - Pruebas de suavidad

3. **Fase 3: Fondo paraláctico (1-2h)**
   - Crear capas de background
   - Implementar detección de scroll
   - Sincronizar movimiento

4. **Fase 4: Face ID (1-2h)**
   - Integrar expo-local-authentication
   - Crear UI de autenticación
   - Manejo de errores

5. **Fase 5: Testing (1h)**
   - Pruebas en dispositivo real
   - Optimización de performance
   - Validación de animaciones suave

### 1.4 Consideraciones Técnicas

```
Performance:
- Usar useNativeDriver={true} para animaciones
- Implementar shouldRasterizeIOS para componentes complejos
- Memoziar componentes para evitar re-renders

Compatibilidad:
- Face ID: solo iOS
- Huella: iOS (Touch ID) + Android (BiometricPrompt)
- Fallback: login con email/contraseña
```

---

## 📌 FUNCIONALIDAD 2: ANIMACIÓN DE COHETE EN CREAR CUENTA

### 2.1 Objetivos
- Animación visual satisfactoria al crear cuenta
- Feedback positivo del usuario
- Transición suave a onboarding

### 2.2 Componentes a Crear/Modificar

#### **Archivo: `mobile/src/components/RocketAnimation.js` (Nueva)**

```
Propiedades:
- onAnimationComplete: callback
- duration: número en ms (default: 2000)
- colors: objeto con colores

Comportamiento:
- Cohete inicia desde abajo al centro
- Sube con aceleración
- Emite partículas de fuego
- Starbursts al llegar arriba
- Confeti cayendo
- Duración total: ~2s
```

#### **Archivo: `mobile/src/screens/auth/RegisterScreen.js` (Modificación)**

**Cambios:**
```javascript
// Agregar estado
const [showRocketAnimation, setShowRocketAnimation] = useState(false);

// Modificar handleRegister
const handleRegister = async () => {
  // ... validaciones ...
  
  try {
    setShowRocketAnimation(true);
    await register(email, password, fullName);
    
    // Esperar fin de animación antes de navegar
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.PROFILE }]
      });
    }, 2000);
  } catch (error) {
    setShowRocketAnimation(false);
    // ... manejo error ...
  }
};

// En JSX
{showRocketAnimation && <RocketAnimation onAnimationComplete={...} />}
```

### 2.3 Componentes Secundarios

#### **Archivo: `mobile/src/components/Particle.js` (Nueva)**

```
- Partícula individual de fuego
- Posición y escala animadas
- Opacidad que desvanece
```

#### **Archivo: `mobile/src/components/Confetti.js` (Nueva)**

```
- Confeti cayendo
- Rotación aleatoria
- Velocidades variables
```

### 2.4 Flujo de Implementación

1. Crear componente RocketAnimation básico (SVG)
2. Animar posición Y (rise animation)
3. Agregar rotación de llama
4. Crear partículas de fuego
5. Agregar confeti
6. Integrar en RegisterScreen
7. Testing y refinamiento

### 2.5 Timing

- **Estimado: 3-4 horas**
- Diseño SVG: 30 min
- Animaciones base: 1h
- Partículas: 1h
- Integración: 1h

---

## 📌 FUNCIONALIDAD 3: DIVIDIR GASTOS (SPLIT BILL)

### 3.1 Objetivos
- Permitir dividir gastos entre múltiples personas
- Interfaz visual clara (similar a Tricount)
- Cálculo automático de deudas
- Historial de divisiones

### 3.2 Modelos de Base de Datos a Crear

#### **ExpenseShare (Nueva tabla)**
```sql
CREATE TABLE expense_shares (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  expense_id UUID, -- puede ser NULL inicialmente
  title VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10, 2),
  split_type ENUM('EQUAL', 'CUSTOM', 'PERCENTAGE', 'ITEMS'),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE expense_share_members (
  id UUID PRIMARY KEY,
  share_id UUID REFERENCES expense_shares(id),
  user_id UUID REFERENCES users(id),
  amount_owed DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2),
  percentage DECIMAL(5, 2),
  status ENUM('PENDING', 'SETTLED'),
  created_at TIMESTAMP
);

CREATE TABLE expense_share_items (
  id UUID PRIMARY KEY,
  share_id UUID REFERENCES expense_shares(id),
  name VARCHAR(255),
  price DECIMAL(10, 2),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP
);
```

### 3.3 Componentes a Crear/Modificar

#### **Archivo: `mobile/src/screens/expense/SplitBillScreen.js` (Nueva)**

**Flujo:**
1. Pantalla inicial con botón "Nuevo Gasto"
2. Mostrar historial de divisiones recientes

#### **Archivo: `mobile/src/screens/expense/CreateSplitScreen.js` (Nueva)**

**Pasos:**
1. Input de cantidad total
2. Selector de tipo de división:
   - Equitativa (divide entre N personas)
   - Personalizada (ingresar montos específicos)
   - Porcentajes (porcentaje por persona)
   - Items (cada persona paga items específicos)
3. Agregar participantes (search de contactos)
4. Vista de cálculo en tiempo real
5. Confirmación y historial

#### **Archivo: `mobile/src/components/SplitCalculator.js` (Nueva)**

```
Props:
- total: number
- splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE' | 'ITEMS'
- participants: array de {id, name, amount, percentage}

Retorna:
- Desglose visual de la división
- Tabla de quién debe qué
- Animación de cálculos
```

#### **Archivo: `mobile/src/components/ParticipantRow.js` (Nueva)**

```
- Mostrar cada participante
- Input para editar monto/porcentaje según tipo
- Avatar + nombre
- Monto que debe/pagó
```

#### **Archivo: `mobile/src/components/SplitTypeSelector.js` (Nueva)**

```
- 4 botones para tipos de división
- Icons intuitivos
- Animated transition al cambiar
```

### 3.4 Backend API Endpoints

```
POST   /api/splits                 - Crear nueva división
GET    /api/splits                 - Listar mis divisiones
GET    /api/splits/:id             - Detalle de división
PUT    /api/splits/:id             - Actualizar división
DELETE /api/splits/:id             - Eliminar división
POST   /api/splits/:id/settle      - Marcar como pagada
GET    /api/splits/summary         - Resumen de deudas
```

#### **Backend File: `backend/src/models/ExpenseShare.js` (Nueva)**
```javascript
// Sequelize model para ExpenseShare
// Relaciones: user_id, membres (hasMany)
// Métodos: calculateSplit(), getDebtSummary()
```

#### **Backend File: `backend/src/controllers/splitController.js` (Nueva)**
```javascript
// Lógica de negocio para divisiones
// Validación de montos
// Cálculos de deudas
// Historial de cambios
```

### 3.5 UI/UX Considerations

```
Visual Design:
- Tarjetas de gastos recientes
- Colores por estado (pendiente, pagado, cancelado)
- Avatares circulares de participantes
- Badges de estado

Animaciones:
- Fade in/out al agregar participantes
- Slide de montos cuando cambia tipo de división
- Pulse cuando se calcula
- Success feedback al crear
```

### 3.6 Flujo de Implementación

1. **Fase 1: Base de datos (1h)**
   - Crear migrations
   - Crear modelos Sequelize

2. **Fase 2: Backend API (2-3h)**
   - Endpoints CRUD
   - Lógica de cálculos
   - Validaciones

3. **Fase 3: Frontend UI (3-4h)**
   - Componentes base
   - Pantalla de creación
   - Pantalla de detalles

4. **Fase 4: Lógica de divisiones (2-3h)**
   - Calculadora de cada tipo
   - Actualización de cálculos en tiempo real
   - Tests

5. **Fase 5: Integración (2h)**
   - Conectar con API
   - Error handling
   - Loading states

6. **Fase 6: Polish & Testing (2h)**
   - UI refinement
   - Testing completo
   - Performance optimization

**Estimado total: 12-16 horas**

---

## 📌 FUNCIONALIDAD 4: BATTLE PASS - SISTEMA DE RECOMPENSAS

### 4.1 Objetivo Principal
**Enfoque en prevención del sobreendeudamiento a través de gamificación positiva.**

El Battle Pass motiva el ahorro mediante recompensas escalonadas, manteniendo usuarios conscientes de sus gastos.

### 4.2 Concepto

```
NIVELES DE AHORRO MENSUAL:
├─ Nivel 1: $25 ahorrados → Descuento cine (10% off)
├─ Nivel 2: $50 ahorrados → Descuento restaurant (15% off)
├─ Nivel 3: $75 ahorrados → Cashback (5%)
├─ Nivel 4: $100 ahorrados → Premium feature unlock
├─ Nivel 5: $150 ahorrados → Descuento viaje (20% off)
├─ Nivel 6: $200 ahorrados → Experiencia exclusiva
└─ Nivel 7: $300 ahorrados → Badge + Mes gratis premium

RECOMPENSAS POR CATEGORÍA:
├─ Entretenimiento: Cine, conciertos, streaming
├─ Gastronomía: Restaurantes, cafés, delivery
├─ Viajes: Hoteles, transporte, tours
├─ Educación: Cursos, libros, apps
└─ Wellness: Gym, meditación, salud

SISTEMA DE PUNTOS:
- 1 peso ahorrado = 1 punto
- Bonus multiplicador: +50% si logras 7 días consecutivos
- Desafíos especiales: +100 puntos
```

### 4.3 Modelos de Base de Datos

#### **BattlePass (Nueva tabla)**
```sql
CREATE TABLE battle_passes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  month DATE NOT NULL,
  current_level INT DEFAULT 0,
  total_savings DECIMAL(10, 2) DEFAULT 0,
  total_points INT DEFAULT 0,
  completed_missions TEXT[], -- array de mission_ids
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, month)
);

CREATE TABLE battle_pass_rewards (
  id UUID PRIMARY KEY,
  level INT NOT NULL,
  min_savings DECIMAL(10, 2) NOT NULL,
  max_savings DECIMAL(10, 2),
  reward_title VARCHAR(255),
  reward_description TEXT,
  reward_category ENUM('DISCOUNT', 'POINTS', 'BADGE', 'UNLOCK', 'EXPERIENCE'),
  reward_value VARCHAR(255), -- JSON: {"type": "discount", "percentage": 10, "partner": "cinema"}
  icon_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE user_rewards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reward_id UUID REFERENCES battle_pass_rewards(id),
  earned_at TIMESTAMP,
  used_at TIMESTAMP,
  status ENUM('AVAILABLE', 'USED', 'EXPIRED'),
  created_at TIMESTAMP
);

CREATE TABLE battle_pass_challenges (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  challenge_type ENUM('STREAK', 'TARGET', 'CATEGORY'),
  target_value INT,
  bonus_points INT,
  duration_days INT DEFAULT 7,
  icon_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE user_challenges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  challenge_id UUID REFERENCES battle_pass_challenges(id),
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### 4.4 Componentes Frontend

#### **Archivo: `mobile/src/screens/rewards/BattlePassScreen.js` (Nueva)**

**Contenido:**
1. Header con mes actual y progreso visual
2. Barra de progreso grande y atractiva
3. Tarjeta del nivel actual con recompensa
4. Grid/Scroll de próximas recompensas
5. Sección de desafíos activos
6. Botón para ver historial

```javascript
Layout:
┌─────────────────────────────────┐
│ Octubre 2025 - $156.50 / $300   │
│ [████████░░░░░░░░░░░░░░░░░░░░]  │
│        NIVEL 5 - 52% PROGRESO    │
└─────────────────────────────────┘

┌─ RECOMPENSA ACTUAL ─────────────┐
│  🎬 Descuento Cine 10%          │
│  Desbloqueado: 5 de octubre     │
│  [Ver Códigos] [Canjear]        │
└─────────────────────────────────┘

PRÓXIMAS RECOMPENSAS:
┌──────┐ ┌──────┐ ┌──────┐
│ $75  │ │ $100 │ │ $150 │
│ 🍔   │ │ 🔓   │ │ ✈️   │
└──────┘ └──────┘ └──────┘

DESAFÍOS ACTIVOS:
┌─────────────────────────────────┐
│ 🔥 7 días consecutivos ahorros  │
│ [████░░░░░] 4/7 días            │
│ +50 puntos bonus                │
└─────────────────────────────────┘
```

#### **Archivo: `mobile/src/screens/rewards/RewardDetailScreen.js` (Nueva)**

```
Mostrar:
- Detalles completos de recompensa
- Descripción detallada
- Cómo canjear
- Código de descuento
- Empresas asociadas
- Términos y condiciones
```

#### **Archivo: `mobile/src/components/ProgressRing.js` (Nueva)**

```
Animación circular de progreso:
- Círculo animado que se llena
- Porcentaje en el centro
- Colores degradados según nivel
- AnimatedCircle con canvas
```

#### **Archivo: `mobile/src/components/RewardCard.js` (Nueva)**

```
Props:
- reward: objeto de recompensa
- level: número de nivel
- unlocked: boolean
- onPress: callback

Mostrar:
- Icon de recompensa
- Nombre
- Monto requerido
- Estado (bloqueado/disponible)
- Animación de unlock si se alcanza
```

#### **Archivo: `mobile/src/components/ChallengeCard.js` (Nueva)**

```
Props:
- challenge: objeto de desafío
- progress: número (0-100)
- onPress: callback

Mostrar:
- Nombre del desafío
- Descripción
- Barra de progreso lineal
- Bonus de puntos
- Icon inspirador
```

#### **Archivo: `mobile/src/components/UnlockAnimation.js` (Nueva)**

**Trigger:** Cuando alcanza nuevo nivel de ahorro

```
Animación:
- Starburst al centro con "NIVEL DESBLOQUEADO"
- Card de recompensa salta al centro
- Confeti cae
- Sound effect de "ding" satisfactorio
- Duración: 2-3 segundos
```

### 4.5 Backend API Endpoints

```
GET    /api/battle-pass/current           - Estado del battle pass actual
GET    /api/battle-pass/rewards           - Todas las recompensas disponibles
GET    /api/battle-pass/my-rewards        - Recompensas del usuario
GET    /api/battle-pass/challenges        - Desafíos activos
GET    /api/battle-pass/history           - Historial de battle passes
POST   /api/battle-pass/redeem/:rewardId  - Canjear recompensa
GET    /api/battle-pass/monthly-stats     - Estadísticas del mes
```

#### **Backend File: `backend/src/models/BattlePass.js` (Nueva)**
```javascript
// Sequelize model
// Métodos:
// - updateSavings(amount)
// - unlockReward()
// - checkAchievements()
// - calculateLevel()
// - getProgressPercentage()
```

#### **Backend File: `backend/src/services/battlePassService.js` (Nueva)**
```javascript
// Lógica compleja:
// - Detectar nuevo nivel
// - Generar notificaciones
// - Calcular bonificadores
// - Manejar recompensas expiradas
```

#### **Backend File: `backend/src/controllers/battlePassController.js` (Nueva)**
```javascript
// Endpoints para battle pass
// Validación de recompensas
// Cálculos de ahorro mensual
```

### 4.6 Integración con Otras Pantallas

#### **Dashboard Screen (Modificación)**
```javascript
// Agregar widget de battle pass en header
// Mostrar nivel actual y progreso del mes
// Botón rápido a pantalla de recompensas
```

#### **History Screen (Modificación)**
```javascript
// Agregar badge cuando hay transacción que suma al battle pass
// Mostrar puntos ganados en cada Kambio
// Mostrar cuánto falta para próximo nivel
```

#### **Notifications (Nueva integración)**
```javascript
// Push notification cuando desbloquea nivel
// "¡Felicidades! Desbloqueaste Descuento Cine 10%"
// Local notification si está activo
```

### 4.7 Enfoque en Sobreendeudamiento

**Mecanismos de prevención:**

1. **Motivación positiva:**
   - Celebrar cada pequeño ahorro
   - Visualizar progreso continuo
   - Recompensas tangibles

2. **Conciencia de gastos:**
   - Mostrar cálculo en tiempo real
   - Target mensual visible
   - Comparación con meses anteriores

3. **Desafíos sostenibles:**
   - Metas realistas según ingresos
   - Bonus por consistencia (no por cantidad)
   - Recordatorios motivacionales

4. **Educación:**
   - Tips de ahorro en rewards
   - Histórico de patrones
   - Metas personalizadas

### 4.8 Flujo de Implementación

1. **Fase 1: Modelos BD (1-1.5h)**
   - Crear migrations
   - Crear modelos Sequelize
   - Relaciones entre tablas

2. **Fase 2: Backend Logic (2-3h)**
   - BattlePassService
   - Controllers
   - Endpoints API
   - Cálculos y lógica de niveles

3. **Fase 3: Frontend UI (3-4h)**
   - BattlePassScreen
   - RewardDetailScreen
   - Componentes visuales
   - Animaciones básicas

4. **Fase 4: Animaciones (2-3h)**
   - ProgressRing animado
   - UnlockAnimation
   - RewardCard flip
   - Transiciones

5. **Fase 5: Integración (2h)**
   - Conectar con API
   - Actualizar DashboardScreen
   - Notificaciones
   - Loading & error states

6. **Fase 6: Testing & Polish (2-3h)**
   - E2E testing
   - Performance
   - Refinamiento UI
   - Copy de textos

**Estimado total: 12-15 horas**

---

## 📊 RESUMEN DE IMPLEMENTACIÓN

### Timeline Total Estimado
```
Funcionalidad 1 (Inicio + Animaciones): 5-7 horas
Funcionalidad 2 (Rocket Animation):     3-4 horas
Funcionalidad 3 (Split Bill):          12-16 horas
Funcionalidad 4 (Battle Pass):         12-15 horas
─────────────────────────────────────────────────
TOTAL ESTIMADO:                        32-42 horas
```

### Priorización Recomendada
```
SPRINT 1 (Inicio):
1. Animación cohete (más simple, resultado inmediato)
2. Pantalla Welcome mejorada (Face ID es opcional)

SPRINT 2 (Gamificación):
3. Battle Pass (impact en UX, motivación)
4. Sistema de notificaciones para recompensas

SPRINT 3 (Funcionalidad):
5. Split Bill (feature más compleja)
6. Refinamiento y optimización
```

### Dependencias de Librerías

```
Ya instaladas:
✓ react-native-reanimated
✓ react-native-svg (probablemente)
✓ @react-navigation/*

Instalar:
□ expo-local-authentication (para Face ID)
□ lottie-react-native (animaciones complejas opcionales)
□ react-native-svg-charts (si usas gráficos)
```

### Archivos a Crear (Total: 30+ archivos)

**Frontend:**
- 8-10 nuevas screens
- 12-15 nuevos componentes
- 3-4 nuevos servicios
- 2 archivos de utilities

**Backend:**
- 5-6 nuevos modelos
- 3-4 controllers
- 2-3 services
- 3-4 migration files

---

## 🎨 NOTAS DE DISEÑO

### Color Palette para Rewards
```
Nivel 1-2: GOLD     #FFD700
Nivel 3-4: SILVER   #C0C0C0
Nivel 5-7: DIAMOND  #00D9FF

Categories:
Entertainment: #FF6B9D
Gastronomy:   #FFB84D
Travel:       #4CAF50
Education:    #5D6DD9
Wellness:     #FF9AA2
```

### Icons & Emojis
```
Cine:        🎬
Restaurant:  🍔
Viaje:       ✈️
Badge:       🏆
Unlock:      🔓
Streak:      🔥
Challenge:   ⚡
```

---

## 📝 PRÓXIMOS PASOS

1. **Validar con diseñador:** Revisar mockups de UI
2. **Priorizar features:** Decidir qué sprint comienza primero
3. **Asignar desarrolladores:** Distribuir tareas por especialidad
4. **Crear tickets en repositorio:** Desglosar en Issues/PRs
5. **Setup inicial:** Crear ramas y estructura de carpetas

---

## 📞 CONTACTO CON CLAUDE

Para implementación paso a paso con Claude Code:

**Solicitud recomendada:**
```
"Voy a implementar estas 4 funcionalidades en Kambio. 
Comencemos con [Funcionalidad]. 

Necesito que:
1. Generes todos los archivos necesarios
2. Escribas la lógica paso a paso
3. Expliques cada decision técnica
4. Me ayudes a debuggear si hay errores
5. Optimices el código final

¿Comenzamos con la Funcionalidad [X]?"
```

---

**Versión:** 1.0
**Fecha:** Noviembre 3, 2025
**Autor:** Plan de Desarrollo Kambio V2
**Estado:** 🟢 Listo para implementación
