# Guía de Despliegue - Eva Pulse

## 🚀 Despliegue en VPS

### Arquitectura de Conexión

La aplicación está diseñada con **connection pooling** que es perfecto para producción:

- ✅ **Una sola conexión**: Se establece una vez y se reutiliza
- ✅ **Eficiente**: No crea múltiples conexiones innecesarias
- ✅ **Escalable**: Funciona igual en desarrollo y producción
- ✅ **Optimizado para VPS**: Ideal para servidores con recursos limitados

### Configuración de MongoDB en VPS

#### Opción 1: MongoDB en el mismo VPS (localhost)

```env
# .env en el servidor
MONGODB_URI=mongodb://localhost:27017/eva-pulse
```

**Ventajas:**
- Baja latencia (localhost)
- No requiere configuración de red externa
- Más rápido para consultas

**Desventajas:**
- MongoDB y la app comparten recursos del servidor
- Si el servidor falla, todo falla

#### Opción 2: MongoDB en Docker (Recomendado)

```bash
# En el VPS, ejecutar MongoDB en Docker
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

```env
# .env en el servidor
MONGODB_URI=mongodb://localhost:27017/eva-pulse
```

**Ventajas:**
- Aislamiento de servicios
- Fácil de actualizar y mantener
- Puede escalar MongoDB independientemente

#### Opción 3: MongoDB Atlas (Cloud)

```env
# .env en el servidor
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eva-pulse?retryWrites=true&w=majority
```

**Ventajas:**
- No consume recursos del VPS
- Backup automático
- Escalable fácilmente
- Alta disponibilidad

**Desventajas:**
- Latencia de red (aunque mínima)
- Costo adicional

### Variables de Entorno en Producción

```env
# .env en el servidor VPS
MONGODB_URI=mongodb://localhost:27017/eva-pulse
NODE_ENV=production
```

### Verificación de Conexión

La aplicación verifica automáticamente la conexión:

```typescript
// La conexión se establece automáticamente la primera vez
await initializeModels() // Se llama internamente en los servicios
```

### Monitoreo de Conexión

Puedes verificar el estado de la conexión:

```typescript
import { isConnected, getConnection } from '@/lib/db/connection'

// Verificar si está conectado
if (isConnected()) {
  console.log('MongoDB conectado')
}

// Obtener la conexión
const conn = getConnection()
```

### Optimizaciones para Producción

1. **Connection Pooling**: Ya implementado ✅
2. **Índices en MongoDB**: Agregar índices para consultas frecuentes
3. **Variables de entorno**: Usar `.env` en producción
4. **PM2 o similar**: Para mantener la app corriendo
5. **Nginx reverse proxy**: Para servir la aplicación

### Ejemplo de Setup Completo en VPS

```bash
# 1. Instalar MongoDB (o usar Docker)
sudo apt update
sudo apt install mongodb

# 2. Clonar y configurar la app
git clone <repo>
cd eva-pulse
cp .env.example .env
nano .env  # Configurar MONGODB_URI

# 3. Instalar dependencias
yarn install

# 4. Build
yarn build

# 5. Iniciar con PM2
pm2 start yarn --name "eva-pulse" -- start
pm2 save
pm2 startup
```

### Troubleshooting

**Error: "MONGODB_URI is not defined"**
- Verificar que el archivo `.env` existe en el servidor
- Verificar que las variables están correctamente configuradas

**Error: "Connection timeout"**
- Verificar que MongoDB está corriendo: `sudo systemctl status mongodb`
- Verificar firewall: `sudo ufw allow 27017`
- Verificar que la URI es correcta

**Múltiples conexiones**
- La aplicación usa connection pooling, solo debería haber una conexión
- Verificar con: `db.serverStatus().connections` en MongoDB shell

### Conclusión

✅ **La arquitectura actual es perfecta para VPS**
- Connection pooling eficiente
- Una sola conexión reutilizable
- Funciona igual en desarrollo y producción
- Solo necesitas configurar `MONGODB_URI` en el `.env` del servidor


