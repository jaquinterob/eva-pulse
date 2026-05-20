# Guía de despliegue en VPS (Ubuntu) — Eva Pulse

Documento de referencia para replicar un despliegue con **MongoDB en Docker**, **Next.js detrás de PM2**, **Nginx como proxy TLS** y **arranque automático** tras reinicios. Ajusta dominios, rutas de usuario (`ubuntu`/`/home/ubuntu/apps/eva-pulse`) y reglas de firewall según tu entorno.

## Requisitos

- VPS Linux (Ubuntu 22.04/24.x) con acceso `sudo`.
- Puertos en el security group / firewall: **22** (SSH), **80** y **443** (web y Let’s Encrypt). Opcional: **27017** solo si quieres MongoDB Compass desde fuera (restringe el origen a **tu IP**, no abras al mundo completo).
- DNS apuntando al servidor si usarás certificado por **dominio**. Si solo tienes **IP pública**, se puede usar Let’s Encrypt con certificado para IP (perfil corto; ver sección TLS).

---

## 1. Código en el servidor

```bash
sudo mkdir -p /home/ubuntu/apps
sudo chown -R ubuntu:ubuntu /home/ubuntu/apps
cd /home/ubuntu/apps
git clone <TU_REPO_URL> eva-pulse
cd eva-pulse
```

---

## 2. Docker + Docker Compose + MongoDB

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu   # nueva sesión SSH para aplicar el grupo
```

Archivo `docker-compose.yml` (resumen): servicio `mongo:7`, volumen persistente, variables `MONGO_INITDB_ROOT_*` desde `.env`.

- **Solo localhost (más seguro):** `ports: "127.0.0.1:27017:27017"`
- **Acceso externo (Compass por IP):** `ports: "0.0.0.0:27017:27017"` y regla de firewall/SG acotada

```bash
cd /home/ubuntu/apps/eva-pulse
# Crear .env con credenciales Mongo (ver sección 3)
sudo docker compose up -d
```

---

## 3. Variables de entorno (`.env`)

En la raíz del proyecto, archivo **`.env`** (no commitear; ya está en `.gitignore`):

```env
MONGO_INITDB_ROOT_USERNAME=eva_admin
MONGO_INITDB_ROOT_PASSWORD=<contraseña_segura>
MONGODB_URI=mongodb://eva_admin:<contraseña>@127.0.0.1:27017/eva-pulse?authSource=admin
APP_ADMIN_PASSWORD=<opcional: contraseña usuario eva-admin en seed>
JWT_SECRET=<obligatorio en producción: cadena larga y aleatoria>
```

Generar secretos (ejemplo):

```bash
openssl rand -hex 24
chmod 600 .env
```

**Importante:** las variables `MONGO_INITDB_*` solo aplican la **primera vez** que se crea el volumen de datos de Mongo. Si cambias usuario/clave con volumen ya existente, hay que gestionarlo dentro de Mongo o recrear el volumen (pierde datos).

---

## 4. Node.js 20 y dependencias

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
cd /home/ubuntu/apps/eva-pulse
npm ci || npm install
```

---

## 5. Build de producción

```bash
cd /home/ubuntu/apps/eva-pulse
mkdir -p "$HOME/logs/eva-pulse"
npm run build
```

El build carga `.env` de Next según la documentación del framework.

---

## 6. PM2

Instalación global:

```bash
sudo npm install -g pm2
```

`ecosystem.config.js` debe apuntar al directorio real del repo (`cwd: path.join(__dirname)`), ejecutar `next start` solo en **127.0.0.1:3222** (Nginx termina TLS y hace proxy), y `NODE_ENV=production`. Los ficheros de log de PM2 están en **`$HOME/logs/eva-pulse/`** (`pm2-out.log`, `pm2-error.log`), fuera del directorio del proyecto.

```bash
cd /home/ubuntu/apps/eva-pulse
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin bash -lc 'pm2 startup systemd -u ubuntu --hp /home/ubuntu'
```

Si el comando de `startup` muestra otro PATH (por ejemplo de Cursor), repite usando **solo** rutas estándar de sistema como arriba, luego `sudo systemctl enable pm2-ubuntu`.

---

## 7. Usuarios de la aplicación (login web / API)

```bash
cd /home/ubuntu/apps/eva-pulse
npm run seed-users
```

Por defecto se intentan crear **`dev`** (contraseña `dev`) y **`eva-admin`** (contraseña de `APP_ADMIN_PASSWORD` en `.env`). Idempotente si ya existen.

---

## 8. Nginx reverse proxy + HTTPS gratuito

### 8.1 Nginx HTTP → Next (antes del certificado)

```bash
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/eva-pulse >/dev/null << 'NGINX'
upstream eva_pulse_next {
    server 127.0.0.1:3222;
}
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://eva_pulse_next;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/eva-pulse /etc/nginx/sites-enabled/eva-pulse
sudo nginx -t && sudo systemctl reload nginx
```

### 8.2 Certificado Let’s Encrypt

**Opción A — Dominio (recomendado, 90 días típico):**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com --register-unsafely-without-email --agree-tos --non-interactive --redirect
```

Ajusta `server_name` y bloques `ssl_certificate` según lo que certbot deje en el sitio.

**Opción B — Solo IP pública (perfil shortlived, ~6 días; requiere Certbot reciente vía snap):**

```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
IP=$(curl -4 -fsS ifconfig.me)
sudo systemctl stop nginx
sudo snap run certbot certonly --standalone \
  --preferred-profile shortlived \
  --ip-address "$IP" \
  --register-unsafely-without-email \
  --agree-tos --non-interactive
sudo systemctl start nginx
```

Luego configura **443** en Nginx apuntando a:

- `/etc/letsencrypt/live/<IP>/fullchain.pem`
- `/etc/letsencrypt/live/<IP>/privkey.pem`

y opcionalmente **301** desde **:80** a **https**.

**Renovación con autenticación `standalone`:** si Nginx usa el puerto 80, registra hooks para parar/iniciar Nginx durante el renuevo:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/{pre,post,deploy}
sudo install -m 755 /dev/stdin /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh << 'EOF'
#!/bin/sh
systemctl stop nginx
EOF
sudo install -m 755 /dev/stdin /etc/letsencrypt/renewal-hooks/post/start-nginx.sh << 'EOF'
#!/bin/sh
systemctl start nginx
EOF
sudo install -m 755 /dev/stdin /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/sh
systemctl reload nginx || true
EOF
```

Haz que el **timer** de renovación use el certbot del **snap** (el de `apt` suele ser demasiado viejo para certificados por IP):

```bash
sudo mkdir -p /etc/systemd/system/certbot.service.d
sudo tee /etc/systemd/system/certbot.service.d/override.conf >/dev/null << 'EOF'
[Service]
ExecStart=
ExecStart=/snap/bin/certbot -q renew --no-random-sleep-on-renew
EOF
sudo systemctl daemon-reload
```

Prueba: `sudo /snap/bin/certbot renew --dry-run`

---

## 9. Arranque automático tras reinicio (systemd)

### 9.1 Mongo vía Compose (tras Docker)

`/etc/systemd/system/eva-pulse-stack.service`:

```ini
[Unit]
Description=Eva Pulse (Docker Compose — MongoDB)
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/apps/eva-pulse
ExecStart=/usr/bin/docker compose up -d
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable eva-pulse-stack.service
```

### 9.2 PM2 después del stack Docker

`/etc/systemd/system/pm2-ubuntu.service.d/overrides.conf`:

```ini
[Unit]
After=docker.service network-online.target eva-pulse-stack.service
Wants=docker.service
Wants=eva-pulse-stack.service

[Service]
Restart=on-failure
RestartSec=5
```

```bash
sudo systemctl daemon-reload
```

Confirma unidades habilitadas: `docker`, `eva-pulse-stack`, `pm2-ubuntu`, `nginx`, `certbot.timer`.

---

## 10. Comprobaciones rápidas

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3222/
curl -sS -o /dev/null -w "%{http_code}\n" https://TU_HOST/
pm2 status
sudo docker ps
sudo systemctl status nginx --no-pager
```

Login API (ejemplo):

```bash
curl -sS -X POST https://TU_HOST/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev","password":"dev"}'
```

---

## 11. Actualizar la app (sin reinstalar todo)

```bash
cd /home/ubuntu/apps/eva-pulse
git pull
npm ci || npm install
npm run build
pm2 restart eva-pulse
pm2 save
```

---

## 12. Git (identidad de commits)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## Resumen de puertos

| Puerto  | Uso |
|---------|-----|
| 22      | SSH |
| 80      | HTTP (redirección / ACME) |
| 443     | HTTPS (Nginx → Next) |
| 3222    | Next solo en `127.0.0.1` (no exponer a Internet si usas Nginx) |
| 27017   | Mongo (ideal `127.0.0.1`; si es `0.0.0.0`, acota SG a tu IP) |

---

## Referencias en el repo

- `docker-compose.yml` — MongoDB
- `ecosystem.config.js` — PM2 + Next
- `scripts/seed-users.ts` — usuarios iniciales
- `scripts/provision-le-ssl-ip.sh` — ayuda memoria para LE por IP (opcional)

Si algo falla tras un reinicio, revisa en orden: `docker ps`, `systemctl status eva-pulse-stack`, `pm2 logs eva-pulse`, `sudo nginx -t`, `journalctl -u pm2-ubuntu -n 50`.
