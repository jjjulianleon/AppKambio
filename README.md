# Kambio - Fitness Financiero MVP

**Aplicación móvil de ahorro gamificado para jóvenes ecuatorianos**

Proyecto desarrollado para el Concurso de Diners Club - MVP completamente funcional que demuestra viabilidad técnica.

## Descripción del Proyecto

Kambio es una app de "Fitness Financiero" que actúa como coach proactivo de ahorro. En lugar de mostrar informes retrospectivos (autopsia financiera), interviene ANTES de que ocurran los gastos mediante:

- 🎯 Metas de ahorro personalizadas
- ☕ Identificación de "gastos hormiga"
- 📱 Notificaciones inteligentes (nudges) 3x al día
- 💪 Sistema de "Kambios" - registra cada vez que evitas un gasto
- 🎉 Gamificación y celebración de logros

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL (vía Docker)
- Sequelize ORM
- JWT para autenticación
- Expo Server SDK (push notifications)
- node-cron (programación de nudges)

### Mobile
- React Native + Expo
- React Navigation
- React Native Reanimated (animaciones)
- Expo Notifications
- AsyncStorage
- Axios

## Estructura del Proyecto

```
AppKambio/
├── backend/              # API REST
│   ├── src/
│   │   ├── models/       # Modelos de BD
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Endpoints
│   │   ├── services/     # Servicios (nudges, etc.)
│   │   └── middleware/   # Auth, errores
│   ├── docker-compose.yml
│   └── package.json
│
├── mobile/               # App React Native
│   ├── src/
│   │   ├── screens/      # Pantallas
│   │   ├── components/   # Componentes reutilizables
│   │   ├── services/     # API clients
│   │   └── navigation/   # Navegación
│   ├── App.js
│   └── package.json
│
├── Documentos Kambio/    # Documentos del proyecto
└── PROPUESTA_TECNICA_KAMBIO.md
```

## Guía de Instalación y Ejecución Local

### Prerrequisitos

Asegúrate de tener instalado:

- ✅ **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- ✅ **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - [Descargar](https://git-scm.com/)
- ✅ **Expo Go** en tu teléfono móvil (iOS/Android)

### Paso 1: Clonar el repositorio (si aplica)

```bash
git clone <repository-url>
cd AppKambio
```

O navega al directorio existente:
```bash
cd "/mnt/c/Users/Steven Paredes/Documents/AppKambio"
```

### Paso 2: Configurar y ejecutar el Backend

#### 2.1 Instalar dependencias

```bash
cd backend
npm install
```

#### 2.2 Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores (puedes usar los defaults para desarrollo):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://kambio_user:kambio_password@localhost:5432/kambio_db
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion_jwt_kambio_2024
JWT_EXPIRES_IN=7d
EXPO_ACCESS_TOKEN=tu_expo_token_aqui  # Opcional para MVP local
```

#### 2.3 Iniciar PostgreSQL con Docker

```bash
docker-compose up -d
```

Verifica que esté corriendo:
```bash
docker ps
```

Deberías ver `kambio_postgres` en la lista.

#### 2.4 Iniciar el servidor

```bash
npm run dev
```

Deberías ver:
```
✓ Database connection established successfully.
✓ Database models synchronized successfully.
✓ Nudge scheduler initialized with 3 daily jobs
✅ Server is running on port 3000
🎯 Kambio API ready to receive requests!
```

**El backend estará disponible en:** `http://localhost:3000`

### Paso 3: Configurar y ejecutar la App Mobile

Abre una **nueva terminal** (deja el backend corriendo).

#### 3.1 Instalar dependencias

```bash
cd mobile  # Desde la raíz del proyecto
npm install
```

#### 3.2 Configurar la URL del backend

Edita `mobile/src/utils/constants.js`:

**Para iOS:**
```javascript
export const API_URL = 'http://localhost:3000/api';
```

**Para Android Emulator:**
```javascript
export const API_URL = 'http://10.0.2.2:3000/api';
```

**Para dispositivo físico en la misma red WiFi:**
```javascript
export const API_URL = 'http://TU_IP_LOCAL:3000/api';
// Ejemplo: 'http://192.168.1.100:3000/api'
```

Para obtener tu IP local:
- **Windows:** `ipconfig` (busca IPv4 Address)
- **Mac/Linux:** `ifconfig` o `ip addr`

#### 3.3 Iniciar Expo

```bash
npm start
```

Esto abrirá Expo Dev Tools en tu navegador.

#### 3.4 Ejecutar en tu dispositivo

**Opción A: Dispositivo físico (Recomendado)**

1. Instala **Expo Go** desde:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Asegúrate de que tu teléfono y computadora estén en la **misma red WiFi**

3. Desde Expo Go, escanea el QR code que aparece en:
   - iOS: Usa la app Cámara
   - Android: Usa Expo Go directamente

4. La app se cargará automáticamente

**Opción B: Emulador de Android**

```bash
npm run android
```

Requiere Android Studio instalado.

**Opción C: Simulador de iOS (solo Mac)**

```bash
npm run ios
```

Requiere Xcode instalado.

### Paso 4: Probar la Aplicación

#### Flujo de Prueba Sugerido

1. **Registro**
   - Email: `test@kambio.com`
   - Contraseña: `test123`
   - Nombre: `Usuario Test`

2. **Onboarding**
   - Completa el cuestionario de perfil financiero
   - Selecciona 1-2 categorías de gasto hormiga (ej: Cafés, Delivery)
   - Crea tu primera meta (ej: "Viaje a Galápagos", $500)

3. **Dashboard**
   - Verás tu meta con barra de progreso
   - Presiona "Hice un Kambio" para registrar un ahorro
   - Ingresa monto (default $4)
   - ¡Celebra tu primer Kambio!

4. **Progreso**
   - Tap en la meta para ver detalles
   - Historial de todos tus Kambios
   - Progreso hacia tu meta

## Testing de Notificaciones Push

### Configuración (Opcional para MVP Local)

Si quieres probar las notificaciones push:

1. Crea una cuenta en [Expo.dev](https://expo.dev/)
2. Crea un proyecto y obtén tu Project ID
3. Actualiza `mobile/app.json`:
   ```json
   "extra": {
     "eas": {
       "projectId": "tu-project-id"
     }
   }
   ```
4. Actualiza `mobile/src/services/notificationService.js` con tu Project ID

### Enviar Notificación de Prueba

Usa la [herramienta de Expo](https://expo.dev/notifications):
1. Obtén tu Expo Push Token (se muestra en consola al iniciar la app)
2. Ingresa el token en la herramienta
3. Envía una notificación de prueba

## Verificación de Funcionamiento

### Backend Health Check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Kambio API is running",
  "timestamp": "..."
}
```

### Test de Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

### Ver Logs del Backend

En la terminal donde corre el backend, verás:
- Requests entrantes (gracias a Morgan)
- Conexiones a BD
- Errores (si los hay)

### Ver Logs de la App Mobile

En la terminal de Expo:
- Presiona `j` para abrir el debugger
- Los logs aparecen en la terminal automáticamente

## Troubleshooting

### Backend no se conecta a PostgreSQL

```bash
# Reiniciar Docker
docker-compose down
docker-compose up -d

# Verificar logs
docker logs kambio_postgres
```

### Mobile no se conecta al Backend

1. Verifica que el backend esté corriendo (`http://localhost:3000/health`)
2. En Android Emulator, usa `10.0.2.2` en lugar de `localhost`
3. En dispositivo físico, usa tu IP local (192.168.x.x)
4. Verifica firewall/antivirus

### Error: Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Expo: Error loading app

```bash
cd mobile
rm -rf node_modules
npm install
npx expo start -c  # Clear cache
```

## Detener los Servicios

### Detener Backend

En la terminal del backend, presiona `Ctrl + C`

### Detener PostgreSQL

```bash
cd backend
docker-compose down
```

### Detener Expo

En la terminal de Expo, presiona `Ctrl + C`

## Próximos Pasos (Post-MVP)

- [ ] Conexión con APIs bancarias (Kushki, Datafast)
- [ ] Algoritmos de ML para análisis predictivo
- [ ] Funcionalidades sociales (metas compartidas)
- [ ] Sistema de insignias y logros
- [ ] Integración con Cooperativa San Francisco
- [ ] Deploy a producción (Railway/AWS)

## Recursos Adicionales

- 📄 [Propuesta Técnica Completa](PROPUESTA_TECNICA_KAMBIO.md)
- 📊 [Documento de Proyecto](Documentos%20Kambio/Draft_app_Kambio.pdf)
- 🔗 [Backend README](backend/README.md)
- 📱 [Mobile README](mobile/README.md)

## Soporte

Para problemas o preguntas:
1. Revisa esta guía completamente
2. Verifica los logs de backend y mobile
3. Consulta los READMEs específicos de cada componente

## Licencia

MIT License - Creado para el Concurso de Diners Club 2024

---

**¡Haz tu primer Kambio hoy!** 💪
