# Eva Pulse

Aplicación monolítica construida con Next.js y TypeScript que integra backend y frontend en un solo proyecto.

## 🚀 Stack Tecnológico

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca de UI
- **API Routes** - Backend integrado

## 📁 Estructura del Proyecto

```
eva-pulse/
├── app/
│   ├── api/              # Backend - API Routes
│   │   └── health/       # Health check endpoint
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página de inicio
│   └── globals.css       # Estilos globales
├── components/
│   └── ui/               # Componentes UI reutilizables
│       ├── ThemeProvider/
│       └── ThemeToggle/
├── lib/
│   ├── config/           # Configuraciones (tema)
│   ├── db/               # Conexión MongoDB
│   └── hooks/            # Custom hooks
├── types/                # Definiciones de tipos TypeScript
└── public/               # Archivos estáticos
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con valores reales (no commitear)
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health` - Verifica el estado de la API

## 🎯 Características

- ✅ Aplicación monolítica (backend + frontend)
- ✅ TypeScript configurado con modo estricto
- ✅ MongoDB integrado con connection pooling
- ✅ Sistema de tema (Dark/Light mode)
- ✅ API Routes para el backend
- ✅ App Router de Next.js
- ✅ Estructura organizada y escalable
- ✅ Estándares de código documentados

## 🎨 Tema

La aplicación incluye un sistema de tema completo con:
- Dark mode y Light mode
- Configuración centralizada
- Variables CSS del tema
- Toggle para cambiar entre modos

## 🗄️ Base de Datos

- MongoDB configurado y listo
- Connection pooling implementado
- Modelos y servicios preparados para uso

## 📚 Documentación

- `.cursor/CODING_STANDARDS.md` - Estándares de código del proyecto
- `DEPLOY.md` - Despliegue en VPS (Docker, PM2, Nginx, TLS, systemd)
- `.cursor/MONGODB_SETUP.md` - Configuración de MongoDB (referencia en repo)

