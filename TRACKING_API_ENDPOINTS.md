# API Endpoints - Tracking de Eventos Eva Pulse

## 📡 Documentación Completa de Endpoints

Este documento describe todos los endpoints disponibles para que tu aplicación envíe eventos de tracking a Eva Pulse.

**URL Base:** `https://tu-dominio.com/api/tracking`  
**URL Desarrollo:** `http://localhost:3000/api/tracking`

**Usuario de desarrollo:** `dev`

---

## 🔐 Autenticación

Actualmente los endpoints no requieren autenticación para desarrollo. En producción se puede agregar autenticación por API key si es necesario.

---

## 📋 Endpoints Disponibles

### 1. Iniciar Sesión de Tracking

Inicia una nueva sesión de tracking cuando el usuario abre la aplicación.

**Endpoint:** `POST /api/tracking/session/start`

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "appUsername": "dev",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "platform": "Web",
    "screenWidth": 1920,
    "screenHeight": 1080,
    "language": "es-ES"
  },
  "location": {
    "timezone": "America/Bogota"
  }
}
```

**Campos Requeridos:**
- `sessionId` (string): ID único de la sesión (UUID recomendado)
- `appUsername` (string): Nombre de usuario de la app (usar `"dev"` para desarrollo)
- `deviceInfo` (object): Información del dispositivo
  - `userAgent` (string): User agent del navegador/dispositivo
  - `platform` (string): Plataforma (Web, iOS, Android, etc.)
  - `screenWidth` (number, opcional): Ancho de pantalla en píxeles
  - `screenHeight` (number, opcional): Alto de pantalla en píxeles
  - `language` (string): Idioma del dispositivo (ej: "es-ES")

**Campos Opcionales:**
- `location` (object): Información de ubicación
  - `timezone` (string): Zona horaria (ej: "America/Bogota")
  - `country` (string, opcional): País del usuario

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-01-15T10:00:00.000Z",
    "message": "Sesión iniciada correctamente"
  }
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

**Ejemplo de Uso (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/tracking/session/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    appUsername: 'dev',
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'Web',
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      language: navigator.language || 'es-ES'
    },
    location: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })
})

const data = await response.json()
```

---

### 2. Enviar Evento de Tracking

Envía un evento de comportamiento del usuario.

**Endpoint:** `POST /api/tracking/events`

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "appUsername": "dev",
  "eventType": "interaction",
  "eventName": "button_click",
  "context": {
    "page": "dashboard",
    "component": "SearchButton",
    "elementId": "search-btn",
    "elementType": "button",
    "route": "/dashboard",
    "url": "https://app.eva.com/dashboard"
  },
  "properties": {
    "buttonText": "Buscar",
    "buttonType": "primary"
  },
  "metadata": {
    "success": true,
    "duration": 100
  },
  "timestamp": "2024-01-15T10:05:30.000Z"
}
```

**Campos Requeridos:**
- `sessionId` (string): ID de la sesión (debe existir)
- `appUsername` (string): Nombre de usuario de la app
- `eventType` (string): Tipo de evento. Valores permitidos:
  - `"authentication"` - Eventos de autenticación (login, logout, registro)
  - `"interaction"` - Interacciones con elementos (clicks, toques, focus, cambios)
  - `"event"` - Eventos generales (evaluaciones, rendimiento, etc.)
  - `"navigation"` - Navegación entre páginas/pantallas
  - `"error"` - Errores y excepciones
- `eventName` (string): Nombre específico del evento (ej: "button_click", "page_view")

**Campos Opcionales:**
- `context` (object): Contexto donde ocurrió el evento
  - `page` (string): Página/pantalla actual
  - `component` (string): Componente interactuado
  - `elementId` (string): ID del elemento HTML
  - `elementType` (string): Tipo de elemento (button, link, input, etc.)
  - `url` (string): URL completa (para web)
  - `route` (string): Ruta de la aplicación
- `properties` (object): Propiedades adicionales del evento (cualquier objeto JSON)
- `metadata` (object): Metadatos del evento
  - `duration` (number): Duración en milisegundos
  - `value` (string | number): Valor asociado
  - `previousValue` (any): Valor anterior
  - `error` (string): Mensaje de error
  - `success` (boolean): Si la acción fue exitosa
- `timestamp` (string): ISO 8601 timestamp (opcional, se usa server time si no se envía)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "event-123-456-789",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:05:30.000Z",
    "message": "Evento registrado correctamente"
  }
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

**Ejemplos de Uso por Tipo de Evento:**

#### Navigation - Visualización de Página
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
    eventType: 'navigation',
    eventName: 'page_view',
    context: {
      page: 'dashboard',
      route: '/dashboard',
      url: window.location.href
    },
    properties: {
      referrer: document.referrer || 'direct'
    }
  })
})
```

#### Interaction - Click en Botón
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
    eventType: 'interaction',
    eventName: 'button_click',
    context: {
      page: 'dashboard',
      component: 'SearchButton',
      elementId: 'search-btn',
      elementType: 'button',
      route: '/dashboard'
    },
    properties: {
      buttonText: 'Buscar',
      buttonType: 'primary'
    }
  })
})
```

#### Authentication - Inicio de Sesión
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
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
  })
})
```

#### Interaction - Focus en Input
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
    eventType: 'interaction',
    eventName: 'input_focus',
    context: {
      page: 'dashboard',
      component: 'SearchInput',
      elementType: 'input',
      route: '/dashboard'
    },
    properties: {
      searchType: 'users'
    }
  })
})
```

#### Event - Respuesta a Evaluación
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
    eventType: 'event',
    eventName: 'answer_submitted',
    context: {
      page: 'evaluation',
      component: 'QuestionForm',
      route: '/evaluation/123'
    },
    properties: {
      evaluationId: 'eval-123',
      questionId: 'q-456',
      answerType: 'multiple_choice'
    },
    metadata: {
      value: 'option-b',
      success: true
    }
  })
})
```

#### Event - Métrica de Rendimiento
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
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
  })
})
```

#### Error - Error de API
```javascript
await fetch('http://localhost:3000/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev',
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
  })
})
```

---

### 3. Finalizar Sesión de Tracking

Marca el fin de una sesión cuando el usuario cierra la aplicación.

**Endpoint:** `POST /api/tracking/session/end`

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "appUsername": "dev"
}
```

**Campos Requeridos:**
- `sessionId` (string): ID de la sesión a finalizar
- `appUsername` (string): Nombre de usuario de la app

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "endTime": "2024-01-15T10:30:00.000Z",
    "duration": 1800,
    "eventCount": 45,
    "message": "Sesión finalizada correctamente"
  }
}
```

**Response Error (400/404/500):**
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

**Ejemplo de Uso:**
```javascript
const response = await fetch('http://localhost:3000/api/tracking/session/end', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionId: sessionId,
    appUsername: 'dev'
  })
})

const data = await response.json()
```

---

## 🔄 Flujo Completo de Uso

### Paso 1: Iniciar Sesión
```javascript
// Al abrir la app
const sessionId = generateUUID()
localStorage.setItem('eva_pulse_session_id', sessionId)

await fetch('/api/tracking/session/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    appUsername: 'dev',
    deviceInfo: { /* ... */ },
    location: { /* ... */ }
  })
})
```

### Paso 2: Enviar Eventos (múltiples veces durante la sesión)
```javascript
// Cada vez que ocurre una acción
await fetch('/api/tracking/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    appUsername: 'dev',
    eventType: 'interaction',
    eventName: 'button_click',
    context: { /* ... */ },
    properties: { /* ... */ }
  })
})
```

### Paso 3: Finalizar Sesión
```javascript
// Al cerrar la app o cerrar sesión
await fetch('/api/tracking/session/end', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    appUsername: 'dev'
  })
})

localStorage.removeItem('eva_pulse_session_id')
```

---

## 📊 Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **400 Bad Request**: Datos inválidos o faltantes
- **404 Not Found**: Sesión no encontrada (para session/end)
- **500 Internal Server Error**: Error del servidor

---

## ⚠️ Validaciones

### Session Start
- `sessionId` debe ser único (no puede existir una sesión activa con el mismo ID)
- `appUsername` es requerido
- `deviceInfo` es requerido con al menos `userAgent` y `platform`

### Events
- `sessionId` debe existir y estar activa
- `appUsername` debe coincidir con el de la sesión
- `eventType` debe ser uno de los valores permitidos
- `eventName` es requerido y no puede estar vacío

### Session End
- `sessionId` debe existir
- `appUsername` debe coincidir con el de la sesión

---

## 🧪 Ejemplos de Testing

### Usando cURL

#### Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/tracking/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "appUsername": "dev",
    "deviceInfo": {
      "userAgent": "Mozilla/5.0",
      "platform": "Web",
      "screenWidth": 1920,
      "screenHeight": 1080,
      "language": "es-ES"
    },
    "location": {
      "timezone": "America/Bogota"
    }
  }'
```

#### Enviar Evento
```bash
curl -X POST http://localhost:3000/api/tracking/events \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "appUsername": "dev",
    "eventType": "interaction",
    "eventName": "button_click",
    "context": {
      "page": "dashboard",
      "component": "SearchButton",
      "elementType": "button"
    },
    "properties": {
      "buttonText": "Buscar"
    }
  }'
```

#### Finalizar Sesión
```bash
curl -X POST http://localhost:3000/api/tracking/session/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "appUsername": "dev"
  }'
```

---

## 📝 Notas Importantes

1. **Usuario de desarrollo**: Usa `"dev"` como `appUsername` durante desarrollo
2. **Session ID**: Debe persistir durante toda la sesión del usuario
3. **Timestamp**: Opcional en eventos, el servidor lo genera automáticamente
4. **Errores**: El tracking nunca debe interrumpir tu aplicación
5. **Performance**: Los eventos se envían de forma asíncrona
6. **Validación**: El servidor valida todos los campos requeridos
7. **Rate Limiting**: En producción se puede implementar rate limiting si es necesario

---

## 🔗 Endpoints Resumen

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/tracking/session/start` | Iniciar una nueva sesión de tracking |
| POST | `/api/tracking/events` | Enviar un evento de comportamiento |
| POST | `/api/tracking/session/end` | Finalizar una sesión de tracking |

---

**Listo para usar en tu aplicación!** 🚀

