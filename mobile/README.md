# Kambio Mobile App

Aplicación móvil de Fitness Financiero construida con React Native y Expo.

## Stack Tecnológico

- **React Native** + **Expo** - Framework móvil
- **React Navigation** - Navegación
- **Axios** - Cliente HTTP
- **React Native Reanimated** - Animaciones
- **Expo Notifications** - Push notifications
- **AsyncStorage** - Almacenamiento local

## Instalación y Configuración

### 1. Instalar dependencias

```bash
cd mobile
npm install
```

### 2. Configurar la URL del backend

Edita `src/utils/constants.js` y actualiza `API_URL`:

```javascript
export const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // Para iOS
  // ? 'http://10.0.2.2:3000/api'  // Para Android Emulator
  : 'https://your-production-api.com/api';
```

**Importante para Android Emulator:** Usa `10.0.2.2` en lugar de `localhost`

### 3. Iniciar la aplicación

```bash
npm start
```

Esto abrirá Expo Dev Tools en tu navegador.

### Ejecutar en dispositivo físico

1. Instala **Expo Go** en tu dispositivo (iOS/Android)
2. Escanea el QR code desde Expo Dev Tools
3. La app se cargará automáticamente

### Ejecutar en emulador

**iOS (requiere macOS con Xcode):**
```bash
npm run ios
```

**Android (requiere Android Studio):**
```bash
npm run android
```

## Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/           # Pantallas de autenticación
│   │   ├── onboarding/     # Flujo de onboarding
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── goal/           # Gestión de metas
│   │   └── kambio/         # Registro de kambios
│   ├── components/         # Componentes reutilizables
│   ├── navigation/         # Configuración de navegación
│   ├── services/           # Servicios API
│   ├── utils/              # Utilidades y constantes
│   └── assets/             # Imágenes y animaciones
├── App.js                  # Punto de entrada
├── app.json                # Configuración de Expo
└── package.json
```

## Flujo de Usuario

1. **Welcome Screen** - Pantalla de bienvenida
2. **Register/Login** - Autenticación
3. **Onboarding:**
   - Perfil financiero (preguntas sobre hábitos)
   - Transacciones (simuladas en MVP)
   - Selección de categorías de gasto hormiga (1-2)
4. **Create Goal** - Crear primera meta
5. **Dashboard** - Pantalla principal
   - Ver progreso de metas
   - Botón "Hice un Kambio"
   - Lista de kambios recientes
6. **Kambio Screen** - Registrar ahorro
7. **Goal Detail** - Detalles de meta

## Notificaciones Push

### Configuración

1. Crea un proyecto en [Expo](https://expo.dev/)
2. Obtén tu Project ID
3. Actualiza `app.json`:
```json
{
  "extra": {
    "eas": {
      "projectId": "tu-project-id-aqui"
    }
  }
}
```

4. Actualiza `src/services/notificationService.js`:
```javascript
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'tu-project-id'
});
```

### Testing de Notificaciones

En desarrollo, puedes enviar notificaciones de prueba usando:
- [Expo Push Notification Tool](https://expo.dev/notifications)
- El token se registra automáticamente al iniciar sesión

## Colores y Branding

Los colores principales están en `src/utils/constants.js`:

```javascript
export const COLORS = {
  primary: '#6C63FF',      // Morado principal
  secondary: '#5A52D5',    // Morado oscuro
  accent: '#FF6584',       // Rosa/rojo
  success: '#4CAF50',      // Verde
  // ...
};
```

## Componentes Principales

### ProgressBar
Barra de progreso animada para metas:
```jsx
<ProgressBar
  current={50}
  target={100}
  showLabels={true}
/>
```

### KambioButton
Botón principal para registrar kambios:
```jsx
<KambioButton
  onPress={handleKambio}
  loading={false}
/>
```

### GoalCard
Tarjeta de meta con progreso:
```jsx
<GoalCard
  goal={goalData}
  onPress={() => navigate('GoalDetail')}
/>
```

## Desarrollo

### Hot Reload

Expo soporta hot reload automático. Simplemente guarda tus cambios y la app se recargará.

### Debug

Para ver logs en tiempo real:
```bash
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

O usa el debugger integrado de Expo presionando `j` en la terminal.

## Build para Producción

### Android (APK)

```bash
expo build:android -t apk
```

### iOS (requiere cuenta de Apple Developer)

```bash
expo build:ios
```

### EAS Build (recomendado)

```bash
npm install -g eas-cli
eas build:configure
eas build --platform all
```

## Troubleshooting

### Error: Network request failed

- Verifica que el backend esté corriendo
- En Android Emulator, usa `10.0.2.2` en lugar de `localhost`
- Verifica que no haya firewalls bloqueando la conexión

### Error: Unable to resolve module

```bash
npm install
npx expo start -c  # Clear cache
```

### Notificaciones no funcionan

- Usa un dispositivo físico (no funciona en simulador de iOS)
- Verifica permisos de notificaciones en configuración del dispositivo
- Asegúrate de tener un Project ID válido de Expo

## Licencia

MIT
