# Conexión a MongoDB desde Compass

## 🔌 String de Conexión

Para conectarte a tu MongoDB local desde MongoDB Compass, usa:

```
mongodb://localhost:27017/eva-pulse
```

## 📝 Pasos para Conectar

1. **Abrir MongoDB Compass**
2. **Pegar el string de conexión** en el campo de conexión
3. **Click en "Connect"**

## 🔍 Desglose del String

- `mongodb://` - Protocolo de conexión
- `localhost` - Host (127.0.0.1 también funciona)
- `27017` - Puerto por defecto de MongoDB
- `eva-pulse` - Nombre de la base de datos

## 🌐 Variaciones del String

### Conexión Básica (sin especificar base de datos)
```
mongodb://localhost:27017
```
Luego seleccionas la base de datos en Compass.

### Con Autenticación (si la configuraste)
```
mongodb://usuario:contraseña@localhost:27017/eva-pulse
```

### Para MongoDB Atlas (Cloud)
```
mongodb+srv://usuario:contraseña@cluster.mongodb.net/eva-pulse?retryWrites=true&w=majority
```

## ✅ Verificar Conexión

Una vez conectado en Compass, deberías ver:
- Base de datos `eva-pulse`
- Colecciones (si ya creaste alguna)
- Datos (si ya insertaste documentos)

## 🎯 Colecciones Esperadas

Cuando empieces a crear modelos, verás colecciones como:
- `users` - Para usuarios
- `products` - Para productos
- O las que definas según tus modelos

## 🔧 Troubleshooting

**No se puede conectar:**
- Verifica que MongoDB esté corriendo: `lsof -i :27017`
- Verifica que el puerto 27017 esté abierto
- Intenta con `127.0.0.1` en lugar de `localhost`

**No veo la base de datos:**
- La base de datos se crea automáticamente cuando insertas el primer documento
- Si no hay datos, la base de datos puede no aparecer hasta que haya contenido

