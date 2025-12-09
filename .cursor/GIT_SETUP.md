# Configuración de Git - Solución de Autenticación

## 🔐 Problema de Autenticación

Si recibes el error `Permission denied` o `403`, necesitas configurar un **Personal Access Token (PAT)** de GitHub.

## 📝 Solución: Usar Personal Access Token

### Paso 1: Crear un Personal Access Token en GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre (ej: "Eva Pulse Development")
4. Selecciona los scopes:
   - ✅ `repo` (acceso completo a repositorios)
5. Click en "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)

### Paso 2: Usar el Token

Cuando hagas `git push`, Git te pedirá credenciales:

```
Username: jaquinterob
Password: [PEGA AQUÍ TU TOKEN, NO TU CONTRASEÑA]
```

### Paso 3: Guardar Credenciales (Opcional)

Para no tener que ingresar el token cada vez:

```bash
# Configurar Git para guardar credenciales
git config --global credential.helper osxkeychain

# Luego al hacer push, ingresa el token una vez y se guardará
```

## 🔄 Comandos para Hacer Push

```bash
# 1. Agregar archivos
git add .

# 2. Hacer commit
git commit -m "Tu mensaje de commit"

# 3. Hacer push (te pedirá el token la primera vez)
git push -u origin main
```

## 🔑 Alternativa: SSH (si tienes la clave configurada)

Si prefieres usar SSH:

1. Asegúrate de que tu clave SSH esté agregada a GitHub
2. Cambia el remote:
```bash
git remote set-url origin git@github.com:jaquinterob/eva-pulse.git
```

## ✅ Verificar Configuración

```bash
# Ver remote configurado
git remote -v

# Ver usuario de Git
git config user.name
git config user.email
```


