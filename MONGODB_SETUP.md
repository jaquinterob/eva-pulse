# Setup MongoDB Local - Eva Pulse

## 🚀 Instalación y Configuración

### Opción 1: MongoDB con Homebrew (macOS - Recomendado)

```bash
# 1. Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# 2. Iniciar MongoDB como servicio
brew services start mongodb-community

# 3. Verificar que está corriendo
brew services list | grep mongodb
```

### Opción 2: MongoDB con Docker (Multiplataforma)

```bash
# 1. Ejecutar MongoDB en Docker
docker run -d \
  --name mongodb-eva-pulse \
  --restart unless-stopped \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# 2. Verificar que está corriendo
docker ps | grep mongodb

# 3. Ver logs si es necesario
docker logs mongodb-eva-pulse
```

### Opción 3: Instalación Manual (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb

# Iniciar MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verificar estado
sudo systemctl status mongodb
```

---

## ⚙️ Configuración del Proyecto

### 1. Crear archivo .env

```bash
# Desde la raíz del proyecto
cp .env.example .env
```

### 2. Editar .env

```bash
# Abrir el archivo .env
nano .env
# o
code .env
```

Agregar:
```env
MONGODB_URI=mongodb://localhost:27017/eva-pulse
NODE_ENV=development
```

### 3. Verificar que MongoDB está corriendo

```bash
# Verificar puerto
lsof -i :27017

# O probar conexión con MongoDB shell
mongosh mongodb://localhost:27017/eva-pulse
```

---

## 🧪 Probar la Conexión

### 1. Iniciar la aplicación

```bash
# Instalar dependencias (si no lo has hecho)
yarn install

# Iniciar en modo desarrollo
yarn dev
```

### 2. Probar endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Crear un usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }'

# Obtener todos los usuarios
curl http://localhost:3000/api/users

# Crear un producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "description": "Laptop de alta gama con procesador Intel i7",
    "price": 1299.99,
    "stock": 25
  }'

# Obtener todos los productos
curl http://localhost:3000/api/products
```

### 3. Verificar datos en MongoDB

```bash
# Conectar a MongoDB shell
mongosh mongodb://localhost:27017/eva-pulse

# Ver bases de datos
show dbs

# Usar la base de datos
use eva-pulse

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Ver productos
db.products.find().pretty()
```

---

## 🔧 Comandos Útiles

### MongoDB con Homebrew

```bash
# Iniciar MongoDB
brew services start mongodb-community

# Detener MongoDB
brew services stop mongodb-community

# Reiniciar MongoDB
brew services restart mongodb-community

# Ver estado
brew services list | grep mongodb
```

### MongoDB con Docker

```bash
# Iniciar contenedor
docker start mongodb-eva-pulse

# Detener contenedor
docker stop mongodb-eva-pulse

# Ver logs
docker logs mongodb-eva-pulse

# Eliminar contenedor (CUIDADO: borra los datos)
docker rm -f mongodb-eva-pulse
```

### Verificar Conexión

```bash
# Verificar que el puerto está abierto
lsof -i :27017

# Probar conexión con telnet
telnet localhost 27017

# Ver procesos de MongoDB
ps aux | grep mongod
```

---

## 🐛 Troubleshooting

### Error: "MongoDB no está corriendo"

```bash
# Verificar si está corriendo
brew services list | grep mongodb
# o
docker ps | grep mongodb

# Si no está corriendo, iniciarlo
brew services start mongodb-community
# o
docker start mongodb-eva-pulse
```

### Error: "Port 27017 already in use"

```bash
# Ver qué está usando el puerto
lsof -i :27017

# Si es otro proceso, detenerlo o cambiar el puerto en .env
```

### Error: "Connection refused"

```bash
# Verificar que MongoDB está escuchando
netstat -an | grep 27017

# Verificar logs de MongoDB
# Homebrew:
tail -f /usr/local/var/log/mongodb/mongo.log

# Docker:
docker logs mongodb-eva-pulse
```

### Limpiar base de datos (desarrollo)

```bash
# Conectar a MongoDB
mongosh mongodb://localhost:27017/eva-pulse

# Eliminar base de datos
use eva-pulse
db.dropDatabase()
```

---

## ✅ Checklist de Verificación

- [ ] MongoDB instalado y corriendo
- [ ] Puerto 27017 accesible
- [ ] Archivo `.env` creado con `MONGODB_URI`
- [ ] Aplicación inicia sin errores
- [ ] Endpoints responden correctamente
- [ ] Datos se guardan en MongoDB
- [ ] Puedo ver los datos en MongoDB shell

---

## 📝 Notas

- **Desarrollo**: Usa `mongodb://localhost:27017/eva-pulse`
- **Producción**: Mismo formato, solo cambia el host si MongoDB está en otro servidor
- **Docker**: Los datos persisten en el volumen `mongodb_data`
- **Homebrew**: Los datos están en `/usr/local/var/mongodb`


