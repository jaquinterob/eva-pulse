#!/bin/bash

echo "🚀 Setup MongoDB para Eva Pulse"
echo ""

# Verificar si MongoDB está instalado
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB ya está instalado"
    mongod --version
else
    echo "📦 MongoDB no está instalado"
    
    # Verificar Homebrew
    if command -v brew &> /dev/null; then
        echo "📥 Instalando MongoDB con Homebrew..."
        brew tap mongodb/brew
        brew install mongodb-community
    else
        echo "❌ Homebrew no está instalado"
        echo "Por favor instala MongoDB manualmente o instala Homebrew primero"
        exit 1
    fi
fi

echo ""
echo "🔧 Iniciando MongoDB..."
if command -v brew &> /dev/null; then
    brew services start mongodb-community
    echo "✅ MongoDB iniciado con Homebrew"
else
    echo "⚠️  Por favor inicia MongoDB manualmente"
fi

echo ""
echo "⏳ Esperando 3 segundos para que MongoDB inicie..."
sleep 3

echo ""
echo "🧪 Verificando conexión..."
if lsof -i :27017 &> /dev/null; then
    echo "✅ MongoDB está corriendo en el puerto 27017"
else
    echo "❌ MongoDB no está respondiendo en el puerto 27017"
    exit 1
fi

echo ""
echo "📝 Creando archivo .env..."
if [ ! -f .env ]; then
    cat > .env << ENVEOF
MONGODB_URI=mongodb://localhost:27017/eva-pulse
NODE_ENV=development
ENVEOF
    echo "✅ Archivo .env creado"
else
    echo "⚠️  Archivo .env ya existe, no se sobrescribió"
fi

echo ""
echo "✅ Setup completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica el archivo .env: cat .env"
echo "2. Inicia la aplicación: yarn dev"
echo "3. Prueba los endpoints con los comandos en MONGODB_SETUP.md"
