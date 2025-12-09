# Crear Usuario Dev en MongoDB Compass

## 🚀 Método Rápido: Copiar y Pegar

1. **Abre MongoDB Compass** y conéctate a tu base de datos `eva-pulse`

2. **Selecciona la base de datos** `eva-pulse` en el panel izquierdo

3. **Abre la consola MongoSH** haciendo clic en el ícono de terminal o presionando `Ctrl + L` (Windows/Linux) o `Cmd + L` (Mac)

4. **Copia y pega este comando completo**:

```javascript
use('eva-pulse');

db.users.insertOne({
  username: "dev",
  password: "$2b$10$.oX9LAqm4l2VFMNYQrAjYOpHo3NSENJoKShJzvi8O7G.O6EQiLXR6",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Usuario 'dev' creado exitosamente");
```

5. **Presiona Enter** para ejecutar el comando

## ✅ Verificar que el Usuario Fue Creado

Ejecuta este comando en MongoDB Compass:

```javascript
db.users.find({ username: "dev" })
```

Deberías ver el usuario con el password hasheado.

## 🔄 Generar un Nuevo Hash (Si es Necesario)

Si necesitas generar un nuevo hash, ejecuta:

```bash
yarn tsx scripts/generate-dev-user-hash.ts
```

Esto generará un hash único y te dará el comando actualizado.

## 🔐 Credenciales de Desarrollo

- **Usuario**: `dev`
- **Contraseña**: `dev`

## 📝 Notas

- El password está hasheado con bcrypt (10 rounds)
- El usuario se crea en minúsculas automáticamente
- Si el usuario ya existe, el comando dará un error de duplicado (eso está bien)
