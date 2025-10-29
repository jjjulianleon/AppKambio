# Quickstart - Kambio

Guía rápida para levantar el backend y frontend en tu máquina local y verlo en tu celular.

---

## 🚀 Backend (API REST)

### 1. Verificar que Docker está instalado

```bash
docker --version
```

Expected output: `Docker version 20.10.x` (o superior)

### 2. Iniciar PostgreSQL con Docker

```bash
cd backend
docker-compose up -d
```

### 3. Verificar que PostgreSQL está corriendo

```bash
docker ps
```

Deberías ver un contenedor llamado `kambio_postgres` con status `Up`

Alternativa - Verificar que la base de datos está lista:

```bash
docker exec kambio_postgres pg_isready -U kambio_user
```

Expected output: `accepting connections`

### 4. Instalar dependencias del backend

```bash
npm install
```

### 5. Iniciar el servidor backend

```bash
npm run dev
```

Expected output:
```
✓ Database connection established successfully.
✓ Database models synchronized successfully.
✓ Nudge scheduler initialized with 3 daily jobs
✅ Server is running on port 3000
🎯 Kambio API ready to receive requests!
```

### 6. Verificar que el backend está funcionando

En otra terminal:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Kambio API is running",
  "timestamp": "..."
}
```

---

## 📱 Frontend (Mobile con Expo Go)

### 1. Obtener tu IP local

**Windows (PowerShell):**
```bash
ipconfig | findstr "IPv4"
```

Busca la línea con tu IP (ej: `192.168.0.102`)

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 2. Configurar la URL del backend en la app

Edita `mobile/src/utils/constants.js` línea 4 y reemplaza con tu IP:

```javascript
export const API_URL = __DEV__
  ? 'http://TU_IP_AQUI:3000/api'  // Ejemplo: 'http://192.168.0.102:3000/api'
  : 'https://your-production-api.com/api';
```

### 3. Instalar dependencias del frontend

```bash
cd mobile
npm install
```

### 4. Iniciar Expo

```bash
npm start
```

O para iniciar directamente en modo túnel (más confiable):

```bash
npx expo start --tunnel
```

### 5. Escanear el código QR en tu iPhone

**Opción A: Desde la cámara nativa (Recomendado)**
- Abre la app Cámara en tu iPhone
- Apunta al código QR que aparece en la terminal
- Presiona la notificación que aparece para abrir en Expo Go

**Opción B: Desde Expo Go**
- Abre la app Expo Go
- Ve a "Projects"
- Presiona el botón para escanear QR
- Escanea el código QR de la terminal

### 6. Esperar a que cargue

La primera vez tarda 1-2 minutos. Verás mensajes como:
```
Downloading JavaScript bundle...
Building JavaScript bundle...
```

Una vez cargada, verás la app en tu iPhone.

---

## ✅ Verificación rápida

### Backend listo si:
- ✅ `docker ps` muestra `kambio_postgres` corriendo
- ✅ `curl http://localhost:3000/health` retorna JSON con status OK
- ✅ Terminal del backend muestra "Server is running on port 3000"

### Frontend listo si:
- ✅ Ves el código QR en la terminal de Expo
- ✅ La app carga en tu iPhone
- ✅ Ves la pantalla de bienvenida blanca con el logo 💪

---

## 🔧 Troubleshooting rápido

### Backend no inicia
```bash
# Reiniciar Docker
docker-compose down
docker-compose up -d

# Ver logs
docker logs kambio_postgres
```

### Frontend no se conecta al backend
1. Verifica tu IP es correcta en `constants.js`
2. Verifica que están en la MISMA red WiFi
3. Reinicia Expo: presiona `Ctrl + C` y ejecuta `npm start` de nuevo

### Puerto 3000 en uso
```bash
# Windows
netstat -ano | findstr :3000
powershell -Command "Stop-Process -Id [PID] -Force"

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📋 Checklist de inicio

- [ ] Docker instalado y corriendo
- [ ] PostgreSQL levantado: `docker ps`
- [ ] Backend iniciado: `npm run dev` en `/backend`
- [ ] Backend saludable: `curl http://localhost:3000/health`
- [ ] IP local anotada
- [ ] `constants.js` actualizado con la IP
- [ ] Expo iniciado: `npm start` en `/mobile`
- [ ] Código QR escaneado desde el iPhone
- [ ] App cargada en Expo Go ✅

---

**¿Necesitas ayuda?** Consulta el [README.md](README.md) completo para más detalles.
