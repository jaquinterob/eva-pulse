# Propuesta: Modelo de Tracking de Eventos - Eva Pulse

## 📋 Resumen Ejecutivo

Este documento propone un modelo completo de tracking de eventos para rastrear el comportamiento de usuarios dentro de una aplicación. El sistema utiliza el **nombre de usuario** como identificador principal y genera **IDs de sesión únicos** para diferenciar múltiples sesiones del mismo usuario.

---

## 🏗️ Arquitectura del Modelo

### 1. Modelo de Sesión (Session)

Cada vez que un usuario inicia una sesión en la app, se crea un registro de sesión que agrupa todos los eventos de esa sesión.

```typescript
interface Session {
  sessionId: string          // ID único de sesión (UUID)
  appUsername: string        // Nombre de usuario de la app (clave de identificación)
  startTime: Date           // Inicio de la sesión
  endTime?: Date            // Fin de la sesión (null si está activa)
  duration?: number         // Duración en segundos (calculado)
  deviceInfo: {
    userAgent: string       // User agent del navegador/dispositivo
    platform: string        // iOS, Android, Web, etc.
    screenWidth?: number     // Ancho de pantalla
    screenHeight?: number    // Alto de pantalla
    language: string        // Idioma del dispositivo
  }
  location?: {
    country?: string         // País (opcional, si se permite)
    timezone: string        // Zona horaria
  }
  isActive: boolean         // Si la sesión está activa
  eventCount: number        // Contador de eventos en esta sesión
  createdAt: Date
  updatedAt: Date
}
```

### 2. Modelo de Evento (Event)

Cada interacción del usuario genera un evento que se vincula a una sesión.

```typescript
interface Event {
  eventId: string           // ID único del evento (UUID)
  sessionId: string         // ID de la sesión a la que pertenece
  appUsername: string       // Nombre de usuario de la app
  eventType: EventType      // Tipo de evento (ver tipos abajo)
  eventName: string         // Nombre específico del evento
  timestamp: Date          // Momento exacto del evento
  
  // Contexto de la acción
  context: {
    page?: string           // Página/pantalla donde ocurrió
    component?: string       // Componente interactuado
    elementId?: string       // ID del elemento (si aplica)
    elementType?: string     // Tipo de elemento (button, link, input, etc.)
    url?: string            // URL completa (para web)
    route?: string          // Ruta de la app
  }
  
  // Datos específicos del evento
  properties: {
    [key: string]: any      // Propiedades flexibles según el tipo de evento
  }
  
  // Metadatos adicionales
  metadata: {
    duration?: number       // Duración de la acción (ej: tiempo en página)
    value?: string | number // Valor asociado (ej: texto ingresado, valor seleccionado)
    previousValue?: any     // Valor anterior (para cambios)
    error?: string          // Mensaje de error (si aplica)
    success?: boolean       // Si la acción fue exitosa
  }
  
  createdAt: Date
}
```

### 3. Tipos de Eventos (EventType)

Categorías principales de eventos de comportamiento:

```typescript
type EventType = 
  | 'authentication'  // Eventos de autenticación (login, logout, registro)
  | 'interaction'      // Interacciones con elementos (clicks, toques, focus)
  | 'event'           // Eventos generales (evaluaciones, rendimiento, etc.)
  | 'navigation'      // Navegación entre páginas/pantallas
  | 'error'           // Errores y excepciones
```

---

## 📊 Ejemplos de Eventos por Categoría

### Authentication (Autenticación)
```typescript
{
  eventType: 'authentication',
  eventName: 'login_success',
  context: {
    page: 'login',
    component: 'LoginForm'
  },
  properties: {
    method: 'email',
    success: true
  }
}
```

```typescript
{
  eventType: 'authentication',
  eventName: 'logout',
  context: {
    page: 'dashboard',
    component: 'LogoutButton'
  }
}
```

### Interaction (Interacción)
```typescript
{
  eventType: 'interaction',
  eventName: 'button_click',
  context: {
    page: 'dashboard',
    component: 'SearchButton',
    elementId: 'search-btn',
    elementType: 'button'
  },
  properties: {
    buttonText: 'Buscar',
    position: { x: 100, y: 200 }
  }
}
```

```typescript
{
  eventType: 'interaction',
  eventName: 'input_focus',
  context: {
    page: 'dashboard',
    component: 'SearchInput',
    elementType: 'input'
  },
  properties: {
    searchType: 'users'
  }
}
```

### Event (Eventos Generales)
```typescript
{
  eventType: 'event',
  eventName: 'answer_submitted',
  context: {
    page: 'evaluation',
    component: 'AnswerForm'
  },
  properties: {
    evaluationId: 'eval-789',
    questionId: 'q-123',
    answerType: 'multiple_choice'
  },
  metadata: {
    value: 'option-b',
    success: true
  }
}
```

```typescript
{
  eventType: 'event',
  eventName: 'api_error',
  context: {
    page: 'dashboard',
    component: 'DataFetcher'
  },
  properties: {
    errorCode: '500',
    endpoint: '/api/users'
  },
  metadata: {
    error: 'Internal server error',
    success: false
  }
}
```

```typescript
{
  eventType: 'event',
  eventName: 'page_load',
  context: {
    page: 'dashboard',
    route: '/dashboard'
  },
  properties: {
    loadTime: 1250, // ms
    resourceCount: 15
  }
}
```

### Navigation (Navegación)
```typescript
{
  eventType: 'navigation',
  eventName: 'page_view',
  context: {
    page: 'dashboard',
    route: '/dashboard',
    url: 'https://app.eva.com/dashboard'
  },
  properties: {
    referrer: '/login',
    transitionType: 'push'
  }
}
```

### Error (Errores)
```typescript
{
  eventType: 'error',
  eventName: 'api_error',
  context: {
    page: 'dashboard',
    component: 'DataFetcher',
    route: '/dashboard'
  },
  properties: {
    errorCode: '500',
    endpoint: '/api/users',
    errorType: 'network'
  },
  metadata: {
    error: 'Failed to fetch users',
    success: false
  }
}
```

---

## 🔑 Identificación de Usuarios y Sesiones

### Generación de Session ID

```typescript
// Al iniciar sesión o abrir la app
const sessionId = generateUUID() // Ej: "550e8400-e29b-41d4-a716-446655440000"
const sessionStartTime = new Date()
```

### Flujo de Identificación

1. **Usuario abre la app** → Se genera un nuevo `sessionId`
2. **Usuario se identifica** → Se asocia `appUsername` a la sesión
3. **Eventos se registran** → Todos vinculados al `sessionId` y `appUsername`
4. **Usuario cierra app o timeout** → Se marca `endTime` y `isActive = false`

### Relación de Datos

```
Usuario (appUsername: "juan_perez")
  ├── Sesión 1 (sessionId: "abc-123", startTime: "2024-01-01 10:00")
  │   ├── Evento 1 (authentication: login_success)
  │   ├── Evento 2 (navigation: page_view)
  │   ├── Evento 3 (interaction: button_click)
  │   └── Evento 4 (event: answer_submitted)
  │
  ├── Sesión 2 (sessionId: "def-456", startTime: "2024-01-01 15:00")
  │   ├── Evento 5 (authentication: login_success)
  │   ├── Evento 6 (navigation: page_view)
  │   └── Evento 7 (interaction: input_focus)
  │
  └── Sesión 3 (sessionId: "ghi-789", startTime: "2024-01-02 09:00")
      └── ...
```

---

## 📡 Estructura de API para Envío de Eventos

### Endpoint: POST /api/tracking/events

```typescript
// Request Body
{
  sessionId: string          // ID de sesión (generado en cliente)
  appUsername: string        // Nombre de usuario de la app
  eventType: EventType
  eventName: string
  context: EventContext
  properties?: Record<string, any>
  metadata?: EventMetadata
  timestamp?: string         // ISO string (opcional, se usa server time si no se envía)
}
```

### Endpoint: POST /api/tracking/session/start

```typescript
// Request Body
{
  appUsername: string
  deviceInfo: DeviceInfo
  location?: LocationInfo
}
// Response: { sessionId: string, startTime: string }
```

### Endpoint: POST /api/tracking/session/end

```typescript
// Request Body
{
  sessionId: string
  appUsername: string
}
```

---

## 🗄️ Estructura de Base de Datos

### Colección: sessions

```javascript
{
  _id: ObjectId,
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  appUsername: "juan_perez",
  startTime: ISODate("2024-01-01T10:00:00Z"),
  endTime: ISODate("2024-01-01T10:30:00Z"),
  duration: 1800,
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    platform: "Web",
    screenWidth: 1920,
    screenHeight: 1080,
    language: "es-ES"
  },
  location: {
    timezone: "America/Bogota"
  },
  isActive: false,
  eventCount: 45,
  createdAt: ISODate("2024-01-01T10:00:00Z"),
  updatedAt: ISODate("2024-01-01T10:30:00Z")
}
```

### Colección: events

```javascript
{
  _id: ObjectId,
  eventId: "event-123-456",
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  appUsername: "juan_perez",
  eventType: "interaction",
  eventName: "button_click",
  timestamp: ISODate("2024-01-01T10:05:30Z"),
  context: {
    page: "dashboard",
    component: "SearchButton",
    elementId: "search-btn",
    elementType: "button",
    route: "/dashboard"
  },
  properties: {
    buttonText: "Buscar",
    position: { x: 100, y: 200 }
  },
  metadata: {
    success: true
  },
  createdAt: ISODate("2024-01-01T10:05:30Z")
}
```

### Índices Recomendados

```javascript
// sessions
db.sessions.createIndex({ appUsername: 1, startTime: -1 })
db.sessions.createIndex({ sessionId: 1 }, { unique: true })
db.sessions.createIndex({ isActive: 1 })

// events
db.events.createIndex({ sessionId: 1, timestamp: -1 })
db.events.createIndex({ appUsername: 1, timestamp: -1 })
db.events.createIndex({ eventType: 1, timestamp: -1 })
db.events.createIndex({ eventName: 1 })
db.events.createIndex({ "context.page": 1 })
```

---

## 🎯 Casos de Uso Principales

### 1. Tracking de Navegación
- Páginas visitadas
- Rutas navegadas
- Tiempo en cada página
- Flujo de navegación

### 2. Tracking de Interacciones
- Clicks en botones
- Toques en elementos
- Hovers (si aplica)
- Gestos (swipe, pinch, etc.)

### 3. Tracking de Formularios
- Campos completados
- Validaciones fallidas
- Tiempo en cada campo
- Formularios abandonados

### 4. Tracking de Evaluaciones
- Respuestas enviadas
- Tiempo por pregunta
- Cambios de respuesta
- Evaluaciones completadas

### 5. Tracking de Errores
- Errores de API
- Errores de validación
- Errores de UI
- Stack traces (opcional)

### 6. Tracking de Rendimiento
- Tiempo de carga de páginas
- Tiempo de respuesta de API
- Métricas de recursos
- Latencias

---

## 📈 Métricas y Análisis Posibles

Con este modelo se pueden analizar:

- **Sesiones por usuario**: Cuántas sesiones tiene cada usuario
- **Duración de sesiones**: Tiempo promedio de uso
- **Eventos por sesión**: Actividad del usuario
- **Páginas más visitadas**: Popularidad de contenido
- **Flujos de navegación**: Cómo los usuarios navegan
- **Tasas de conversión**: Completitud de evaluaciones
- **Errores frecuentes**: Problemas comunes
- **Rendimiento**: Tiempos de carga y respuesta
- **Comportamiento por dispositivo**: Diferencias entre plataformas

---

## 🔒 Consideraciones de Privacidad

- Los datos se almacenan de forma segura
- El `appUsername` es el único identificador personal
- Se puede agregar opción de anonimización
- Cumplimiento con políticas de privacidad
- Opción de eliminar datos por usuario

---

## ✅ Ventajas del Modelo Propuesto

1. **Flexible**: Permite agregar nuevos tipos de eventos fácilmente
2. **Escalable**: Estructura optimizada para grandes volúmenes
3. **Completo**: Captura contexto suficiente para análisis detallado
4. **Rastreable**: Vincula eventos a sesiones y usuarios claramente
5. **Extensible**: Fácil agregar nuevos campos sin romper compatibilidad

---

## 🚀 Próximos Pasos (Cuando Apruebes)

1. Crear modelos de MongoDB (Session y Event)
2. Crear servicios de tracking
3. Crear API endpoints para recibir eventos
4. Crear utilidades para generar Session IDs
5. Crear dashboard de visualización de eventos
6. Implementar índices en MongoDB
7. Crear documentación de uso

---

**¿Te parece bien esta propuesta? ¿Quieres que modifique algo antes de implementar?**

