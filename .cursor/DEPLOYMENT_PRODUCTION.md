# 🚀 Guía de Despliegue Profesional - Eva Pulse

Esta guía te ayudará a desplegar tu aplicación Next.js de manera profesional usando un proceso manager, permitiéndote controlar cuando iniciar/detener la aplicación o configurarla para que inicie automáticamente al arrancar el servidor.

---

## 📋 Opción 1: PM2 (Recomendado - Más Fácil)

PM2 es un gestor de procesos para aplicaciones Node.js que es muy fácil de usar y configurar.

### Instalación de PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# O con yarn
yarn global add pm2
```

### Configuración Inicial

```bash
# 1. Navegar al directorio del proyecto
cd /root/eva-pulse

# 2. Asegurarse de tener el archivo .env configurado
nano .env
# Agregar:
# MONGODB_URI=mongodb://localhost:27017/eva-pulse
# NODE_ENV=production

# 3. Instalar dependencias (si no lo has hecho)
npm install
# o
yarn install

# 4. Construir la aplicación
npm run build
# o
yarn build
```

### Iniciar la Aplicación con PM2

```bash
# Iniciar la aplicación
pm2 start npm --name "eva-pulse" -- start
# O si usas yarn:
pm2 start yarn --name "eva-pulse" -- start

# Ver el estado
pm2 status

# Ver logs en tiempo real
pm2 logs eva-pulse

# Ver información detallada
pm2 show eva-pulse
```

### Comandos de Control

```bash
# Detener la aplicación
pm2 stop eva-pulse

# Reiniciar la aplicación
pm2 restart eva-pulse

# Eliminar la aplicación de PM2
pm2 delete eva-pulse

# Ver todos los procesos
pm2 list

# Ver logs
pm2 logs eva-pulse

# Ver logs de los últimos 100 líneas
pm2 logs eva-pulse --lines 100

# Limpiar logs
pm2 flush
```

### Configurar Auto-Inicio al Arrancar el Sistema

**Opción A: Auto-inicio HABILITADO (se inicia automáticamente al encender el servidor)**

```bash
# Guardar la configuración actual de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup

# Esto mostrará un comando, cópialo y ejecútalo (será algo como):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u tu_usuario --hp /home/tu_usuario
```

**Opción B: Auto-inicio DESHABILITADO (solo inicia manualmente)**

```bash
# Simplemente NO ejecutes 'pm2 startup'
# La aplicación solo se iniciará cuando ejecutes: pm2 start npm --name "eva-pulse" -- start
```

**Para DESHABILITAR el auto-inicio si ya lo configuraste:**

```bash
# Deshabilitar el auto-inicio
pm2 unstartup

# O eliminar el servicio systemd manualmente
sudo systemctl disable pm2-tu_usuario
```

### Monitoreo y Gestión Avanzada

```bash
# Dashboard web de PM2 (opcional)
pm2 web

# Monitoreo en tiempo real
pm2 monit

# Reiniciar automáticamente si la app falla
pm2 start npm --name "eva-pulse" -- start --max-restarts 10

# Configurar variables de entorno
pm2 start npm --name "eva-pulse" -- start --update-env
```

### Archivo de Configuración PM2 (Opcional - Más Profesional)

Crea un archivo `ecosystem.config.js` en la raíz del proyecto:

```bash
nano ecosystem.config.js
```

Contenido:

```javascript
module.exports = {
  apps: [{
    name: 'eva-pulse',
    script: 'npm',
    args: 'start',
    cwd: '/root/eva-pulse',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false
  }]
}
```

Luego inicia con:

```bash
# Crear directorio de logs
mkdir -p logs

# Iniciar con el archivo de configuración
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save
```

---

## 📋 Opción 2: systemd (Más Robusto - Nativo de Linux)

systemd es el sistema de gestión de servicios nativo de Linux. Es más robusto pero requiere más configuración.

### Crear el Servicio systemd

```bash
# Crear el archivo de servicio
sudo nano /etc/systemd/system/eva-pulse.service
```

Contenido del archivo:

```ini
[Unit]
Description=Eva Pulse Next.js Application
After=network.target mongodb.service
Wants=mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/eva-pulse
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
# O si usas yarn:
# ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=eva-pulse

# Límites de recursos
LimitNOFILE=65536
MemoryMax=2G

[Install]
WantedBy=multi-user.target
```

**Nota:** Ajusta las rutas según tu instalación:
- `User=root` → Cambia por tu usuario si no eres root
- `WorkingDirectory=/root/eva-pulse` → Cambia por la ruta real de tu proyecto
- `/usr/bin/npm` → Verifica la ruta con `which npm`

### Comandos de Control con systemd

```bash
# Recargar systemd para reconocer el nuevo servicio
sudo systemctl daemon-reload

# Iniciar la aplicación
sudo systemctl start eva-pulse

# Detener la aplicación
sudo systemctl stop eva-pulse

# Reiniciar la aplicación
sudo systemctl restart eva-pulse

# Ver el estado
sudo systemctl status eva-pulse

# Ver logs
sudo journalctl -u eva-pulse -f

# Ver últimos 100 líneas de logs
sudo journalctl -u eva-pulse -n 100
```

### Configurar Auto-Inicio con systemd

**Opción A: Auto-inicio HABILITADO (se inicia automáticamente al encender el servidor)**

```bash
# Habilitar el servicio para que inicie al arrancar
sudo systemctl enable eva-pulse

# Verificar que está habilitado
sudo systemctl is-enabled eva-pulse
```

**Opción B: Auto-inicio DESHABILITADO (solo inicia manualmente)**

```bash
# NO ejecutes 'systemctl enable'
# La aplicación solo se iniciará cuando ejecutes: sudo systemctl start eva-pulse
```

**Para DESHABILITAR el auto-inicio si ya lo configuraste:**

```bash
# Deshabilitar el auto-inicio
sudo systemctl disable eva-pulse
```

### Verificar Dependencias

Si tu aplicación depende de MongoDB, asegúrate de que MongoDB también esté configurado como servicio:

```bash
# Verificar que MongoDB está corriendo
sudo systemctl status mongodb

# Si MongoDB no está configurado, configúralo también
sudo systemctl enable mongodb
sudo systemctl start mongodb
```

---

## 🔧 Configuración de Variables de Entorno

### Con PM2

```bash
# Opción 1: Usar archivo .env (recomendado)
# PM2 automáticamente carga el .env si está en el directorio de trabajo

# Opción 2: Especificar en el comando
pm2 start npm --name "eva-pulse" -- start --update-env \
  --env MONGODB_URI="mongodb://localhost:27017/eva-pulse" \
  --env NODE_ENV="production"

# Opción 3: Usar archivo ecosystem.config.js (ver arriba)
```

### Con systemd

```bash
# Editar el archivo de servicio
sudo nano /etc/systemd/system/eva-pulse.service

# Agregar variables en la sección [Service]:
Environment="MONGODB_URI=mongodb://localhost:27017/eva-pulse"
Environment="NODE_ENV=production"

# Recargar y reiniciar
sudo systemctl daemon-reload
sudo systemctl restart eva-pulse
```

**O usar un archivo de entorno:**

```bash
# Crear archivo de entorno
sudo nano /etc/eva-pulse/env

# Contenido:
MONGODB_URI=mongodb://localhost:27017/eva-pulse
NODE_ENV=production

# En el archivo de servicio, agregar:
EnvironmentFile=/etc/eva-pulse/env
```

---

## 📊 Comparación: PM2 vs systemd

| Característica | PM2 | systemd |
|---------------|-----|---------|
| Facilidad de uso | ⭐⭐⭐⭐⭐ Muy fácil | ⭐⭐⭐ Moderado |
| Auto-inicio | ✅ Fácil | ✅ Nativo |
| Monitoreo | ✅ Dashboard incluido | ⚠️ Requiere herramientas adicionales |
| Logs | ✅ Gestión integrada | ✅ Journal integrado |
| Reinicio automático | ✅ Configurable | ✅ Nativo |
| Recursos del sistema | ⚠️ Consume algo más | ✅ Optimizado |
| Recomendado para | Desarrollo y producción pequeña/mediana | Producción empresarial |

**Recomendación:** Usa **PM2** si quieres algo fácil y rápido. Usa **systemd** si necesitas máxima robustez y control del sistema.

---

## 🚨 Troubleshooting

### La aplicación no inicia

```bash
# Verificar logs
pm2 logs eva-pulse
# o
sudo journalctl -u eva-pulse -n 50

# Verificar que el puerto no está en uso
sudo lsof -i :3000

# Verificar variables de entorno
pm2 show eva-pulse
# o
sudo systemctl show eva-pulse
```

### La aplicación se cae constantemente

```bash
# Verificar logs de errores
pm2 logs eva-pulse --err
# o
sudo journalctl -u eva-pulse -p err

# Verificar recursos del sistema
pm2 monit
# o
htop
```

### MongoDB no está disponible

```bash
# Verificar que MongoDB está corriendo
sudo systemctl status mongodb
# o
docker ps | grep mongo

# Verificar conexión
mongosh mongodb://localhost:27017/eva-pulse
```

### El auto-inicio no funciona

**Con PM2:**
```bash
# Verificar que se guardó la configuración
pm2 save

# Verificar el servicio systemd de PM2
sudo systemctl status pm2-root
# o
sudo systemctl status pm2-tu_usuario

# Reconfigurar
pm2 unstartup
pm2 startup
```

**Con systemd:**
```bash
# Verificar que está habilitado
sudo systemctl is-enabled eva-pulse

# Verificar dependencias
sudo systemctl list-dependencies eva-pulse
```

---

## 📝 Resumen de Comandos Rápidos

### PM2 - Comandos Esenciales

```bash
# Iniciar
pm2 start npm --name "eva-pulse" -- start

# Detener
pm2 stop eva-pulse

# Reiniciar
pm2 restart eva-pulse

# Ver estado
pm2 status

# Ver logs
pm2 logs eva-pulse

# Auto-inicio: HABILITAR
pm2 save && pm2 startup

# Auto-inicio: DESHABILITAR
pm2 unstartup
```

### systemd - Comandos Esenciales

```bash
# Iniciar
sudo systemctl start eva-pulse

# Detener
sudo systemctl stop eva-pulse

# Reiniciar
sudo systemctl restart eva-pulse

# Ver estado
sudo systemctl status eva-pulse

# Ver logs
sudo journalctl -u eva-pulse -f

# Auto-inicio: HABILITAR
sudo systemctl enable eva-pulse

# Auto-inicio: DESHABILITAR
sudo systemctl disable eva-pulse
```

---

## ✅ Checklist de Despliegue

- [ ] Instalar Node.js y npm/yarn
- [ ] Instalar MongoDB o configurar MongoDB Atlas
- [ ] Clonar el repositorio
- [ ] Crear archivo `.env` con `MONGODB_URI` y `NODE_ENV=production`
- [ ] Instalar dependencias: `npm install` o `yarn install`
- [ ] Construir la aplicación: `npm run build` o `yarn build`
- [ ] Elegir PM2 o systemd
- [ ] Configurar el proceso manager
- [ ] Probar iniciar/detener la aplicación
- [ ] Configurar auto-inicio (opcional)
- [ ] Verificar que la aplicación responde en el puerto 3000
- [ ] Configurar firewall si es necesario: `sudo ufw allow 3000`
- [ ] (Opcional) Configurar Nginx como reverse proxy

---

¡Listo! Tu aplicación está desplegada de manera profesional. 🎉

