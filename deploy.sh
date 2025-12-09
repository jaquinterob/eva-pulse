#!/bin/bash

# Script de Despliegue - Eva Pulse
# Este script ayuda a desplegar la aplicación de manera profesional

set -e

echo "🚀 Script de Despliegue - Eva Pulse"
echo "===================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que existe .env
if [ ! -f ".env" ]; then
    print_warning "No se encontró archivo .env"
    read -p "¿Deseas crear uno ahora? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "MONGODB_URI=mongodb://localhost:27017/eva-pulse" > .env
        echo "NODE_ENV=production" >> .env
        print_success "Archivo .env creado. Por favor edítalo con: nano .env"
    else
        print_error "Necesitas crear un archivo .env antes de continuar."
        exit 1
    fi
fi

# Paso 1: Instalar dependencias
print_info "Paso 1: Instalando dependencias..."
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
print_success "Dependencias instaladas"

# Paso 2: Construir la aplicación
print_info "Paso 2: Construyendo la aplicación..."
if command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi
print_success "Aplicación construida"

# Paso 3: Elegir proceso manager
echo ""
print_info "Paso 3: Elegir proceso manager"
echo "1) PM2 (Recomendado - Más fácil)"
echo "2) systemd (Más robusto)"
read -p "Selecciona una opción (1 o 2): " choice

case $choice in
    1)
        # PM2
        print_info "Configurando PM2..."
        
        # Verificar si PM2 está instalado
        if ! command -v pm2 &> /dev/null; then
            print_warning "PM2 no está instalado"
            read -p "¿Deseas instalarlo ahora? (s/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                if command -v yarn &> /dev/null; then
                    yarn global add pm2
                else
                    npm install -g pm2
                fi
                print_success "PM2 instalado"
            else
                print_error "Necesitas instalar PM2 para continuar: npm install -g pm2"
                exit 1
            fi
        fi
        
        # Crear directorio de logs
        mkdir -p logs
        
        # Iniciar con PM2
        print_info "Iniciando aplicación con PM2..."
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js
        else
            if command -v yarn &> /dev/null; then
                pm2 start yarn --name "eva-pulse" -- start
            else
                pm2 start npm --name "eva-pulse" -- start
            fi
        fi
        
        print_success "Aplicación iniciada con PM2"
        
        # Preguntar sobre auto-inicio
        echo ""
        read -p "¿Deseas que la aplicación inicie automáticamente al arrancar el servidor? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            pm2 save
            pm2 startup
            print_success "Auto-inicio configurado. Ejecuta el comando que PM2 te muestra."
        else
            print_info "Auto-inicio no configurado. La aplicación solo se iniciará manualmente."
        fi
        
        echo ""
        print_success "¡Despliegue completado con PM2!"
        echo ""
        echo "Comandos útiles:"
        echo "  - Ver estado: pm2 status"
        echo "  - Ver logs: pm2 logs eva-pulse"
        echo "  - Detener: pm2 stop eva-pulse"
        echo "  - Reiniciar: pm2 restart eva-pulse"
        ;;
    2)
        # systemd
        print_info "Configurando systemd..."
        
        # Obtener el directorio actual
        CURRENT_DIR=$(pwd)
        USER=$(whoami)
        
        # Crear archivo de servicio
        SERVICE_FILE="/etc/systemd/system/eva-pulse.service"
        
        print_warning "Se necesita acceso sudo para crear el servicio systemd"
        
        # Determinar el comando de inicio
        if command -v yarn &> /dev/null; then
            START_CMD="/usr/bin/yarn start"
        else
            START_CMD="/usr/bin/npm start"
        fi
        
        # Crear el archivo de servicio
        sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=Eva Pulse Next.js Application
After=network.target mongodb.service
Wants=mongodb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=$START_CMD
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=eva-pulse

[Install]
WantedBy=multi-user.target
EOF
        
        print_success "Archivo de servicio creado: $SERVICE_FILE"
        
        # Recargar systemd
        sudo systemctl daemon-reload
        print_success "systemd recargado"
        
        # Iniciar el servicio
        sudo systemctl start eva-pulse
        print_success "Servicio iniciado"
        
        # Preguntar sobre auto-inicio
        echo ""
        read -p "¿Deseas que la aplicación inicie automáticamente al arrancar el servidor? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            sudo systemctl enable eva-pulse
            print_success "Auto-inicio habilitado"
        else
            print_info "Auto-inicio no configurado. La aplicación solo se iniciará manualmente."
        fi
        
        # Verificar estado
        sudo systemctl status eva-pulse --no-pager
        
        echo ""
        print_success "¡Despliegue completado con systemd!"
        echo ""
        echo "Comandos útiles:"
        echo "  - Ver estado: sudo systemctl status eva-pulse"
        echo "  - Ver logs: sudo journalctl -u eva-pulse -f"
        echo "  - Detener: sudo systemctl stop eva-pulse"
        echo "  - Reiniciar: sudo systemctl restart eva-pulse"
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_success "🎉 ¡Despliegue completado exitosamente!"
echo ""
print_info "Asegúrate de:"
echo "  1. Verificar que MongoDB está corriendo"
echo "  2. Verificar que el puerto 3000 está accesible"
echo "  3. Revisar los logs para confirmar que todo funciona correctamente"

