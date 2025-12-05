# Cambiar Cuenta de GitHub Solo para Este Proyecto

## 🔄 Configuración Local (Solo este proyecto)

### Paso 1: Configurar Usuario y Email Localmente

```bash
# Configurar nombre de usuario (solo para este proyecto)
git config user.name "TuNombreDeUsuario"

# Configurar email (solo para este proyecto)
git config user.email "tu-email@example.com"
```

### Paso 2: Verificar Configuración

```bash
# Ver configuración local (solo este proyecto)
git config user.name
git config user.email

# Ver configuración global (para comparar)
git config --global user.name
git config --global user.email
```

### Paso 3: Cambiar Remote (si el repositorio es de otra cuenta)

Si el repositorio pertenece a otra cuenta de GitHub:

```bash
# Cambiar URL del remote
git remote set-url origin https://github.com/OTRA-CUENTA/eva-pulse.git

# Verificar
git remote -v
```

### Paso 4: Limpiar Credenciales Guardadas

Para que te pida las credenciales de la nueva cuenta:

```bash
# Limpiar credenciales de GitHub guardadas
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF
```

### Paso 5: Hacer Push con Nueva Cuenta

```bash
git push -u origin main
```

Cuando te pida credenciales:
- **Username**: Tu nuevo nombre de usuario de GitHub
- **Password**: Tu Personal Access Token de la nueva cuenta

## 📝 Ejemplo Completo

```bash
# 1. Configurar usuario local
git config user.name "nuevo-usuario"
git config user.email "nuevo-email@example.com"

# 2. Cambiar remote si es necesario
git remote set-url origin https://github.com/nuevo-usuario/eva-pulse.git

# 3. Limpiar credenciales
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF

# 4. Verificar
git config user.name
git remote -v

# 5. Hacer push (te pedirá credenciales de la nueva cuenta)
git push -u origin main
```

## ✅ Verificar que Funcionó

```bash
# Ver configuración local
git config --local --list | grep user

# Ver remote
git remote -v
```

## 🔑 Nota sobre Personal Access Token

Recuerda que necesitarás un **Personal Access Token** de la nueva cuenta de GitHub:
1. Ve a: https://github.com/settings/tokens
2. Genera un nuevo token con permisos `repo`
3. Úsalo como contraseña cuando Git te lo pida


