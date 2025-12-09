# Manual de Implementación - Tracking de Eventos Eva Pulse

## 📚 Guía para Integrar Tracking en tu Aplicación

Este manual te guiará paso a paso para implementar el sistema de tracking de eventos de Eva Pulse en tu aplicación.

---

## 🎯 Resumen

Eva Pulse es una plataforma de tracking que permite rastrear el comportamiento de usuarios en tu aplicación. Los eventos se envían a través de API REST y se almacenan en MongoDB para análisis posterior.

**Usuario de desarrollo asignado:** `dev`

---

## 🔑 Conceptos Clave

### Identificación de Usuarios
- **appUsername**: El nombre de usuario de tu aplicación (clave principal)
- **sessionId**: ID único generado para cada sesión del usuario
- Un usuario puede tener múltiples sesiones a lo largo del tiempo

### Flujo de Tracking
1. Usuario abre la app → Generar `sessionId`
2. Iniciar sesión de tracking → Enviar evento `session_start`
3. Usuario interactúa → Enviar eventos de comportamiento
4. Usuario cierra app → Enviar evento `session_end`

---

## 🚀 Paso 1: Configuración Inicial

### 1.1 URL Base de la API

```typescript
const EVA_PULSE_API_URL = 'https://tu-dominio.com/api/tracking'
// O en desarrollo:
const EVA_PULSE_API_URL = 'http://localhost:3000/api/tracking'
```

### 1.2 Usuario de Desarrollo

Para desarrollo y pruebas, usa el usuario:
```typescript
const APP_USERNAME = 'dev'
```

### 1.3 Generar Session ID

Cada vez que el usuario abre la app, genera un nuevo Session ID:

```typescript
// Función para generar UUID v4
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Al iniciar la app
const sessionId = generateSessionId()
// Ejemplo: "550e8400-e29b-41d4-a716-446655440000"
```

**Importante:** Guarda el `sessionId` en localStorage o sessionStorage para mantenerlo durante toda la sesión:

```typescript
// Guardar session ID
localStorage.setItem('eva_pulse_session_id', sessionId)

// Recuperar session ID
const sessionId = localStorage.getItem('eva_pulse_session_id') || generateSessionId()
```

---

## 📡 Paso 2: Iniciar Sesión de Tracking

Cuando el usuario abre la app o inicia sesión, envía un evento de inicio de sesión.

### Endpoint: `POST /api/tracking/session/start`

```typescript
async function startTrackingSession(appUsername: string, sessionId: string) {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'Unknown',
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    language: navigator.language || 'es-ES'
  }

  const location = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  const response = await fetch(`${EVA_PULSE_API_URL}/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      appUsername,
      deviceInfo,
      location
    })
  })

  return await response.json()
}

// Uso
const sessionId = generateSessionId()
localStorage.setItem('eva_pulse_session_id', sessionId)

await startTrackingSession('dev', sessionId)
```

---

## 📊 Paso 3: Enviar Eventos

### Endpoint: `POST /api/tracking/events`

Estructura básica de un evento:

```typescript
interface TrackingEvent {
  sessionId: string
  appUsername: string
  eventType: 'authentication' | 'interaction' | 'event' | 'navigation' | 'error'
  eventName: string
  context: {
    page?: string
    component?: string
    elementId?: string
    elementType?: string
    url?: string
    route?: string
  }
  properties?: Record<string, any>
  metadata?: {
    duration?: number
    value?: string | number
    previousValue?: any
    error?: string
    success?: boolean
  }
  timestamp?: string // ISO string (opcional, se usa server time si no se envía)
}
```

### Función Helper para Enviar Eventos

```typescript
async function trackEvent(event: Omit<TrackingEvent, 'sessionId' | 'appUsername'>) {
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  if (!sessionId) {
    console.warn('No session ID found. Starting new session...')
    const newSessionId = generateSessionId()
    localStorage.setItem('eva_pulse_session_id', newSessionId)
    await startTrackingSession('dev', newSessionId)
    return
  }

  try {
    const response = await fetch(`${EVA_PULSE_API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        appUsername: 'dev', // Usuario de desarrollo
        ...event
      })
    })

    if (!response.ok) {
      console.error('Error tracking event:', await response.text())
    }
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}
```

---

## 🎯 Paso 4: Eventos Iniciales para Primera Iteración

Para la primera iteración, te recomendamos implementar estos eventos básicos:

### 4.1 Authentication - Autenticación

**Cuándo:** Usuario inicia sesión o cierra sesión

```typescript
// Ejemplo: Usuario inicia sesión exitosamente
trackEvent({
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

// Ejemplo: Usuario cierra sesión
trackEvent({
  eventType: 'authentication',
  eventName: 'logout',
  context: {
    page: 'dashboard',
    component: 'LogoutButton'
  }
})
```

### 4.2 Navigation - Visualización de Página

**Cuándo:** Cada vez que el usuario navega a una nueva página/pantalla

```typescript
// Ejemplo: Usuario entra al dashboard
trackEvent({
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

// Ejemplo: Usuario va a la página de evaluaciones
trackEvent({
  eventType: 'navigation',
  eventName: 'page_view',
  context: {
    page: 'evaluations',
    route: '/evaluations',
    url: window.location.href
  }
})
```

### 4.3 Interaction - Interacciones con Elementos

**Cuándo:** Usuario interactúa con elementos (clicks, focus, cambios)

```typescript
// Ejemplo: Click en botón de búsqueda
trackEvent({
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

// Ejemplo: Focus en input de búsqueda
trackEvent({
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

// Ejemplo: Cambio en input
trackEvent({
  eventType: 'interaction',
  eventName: 'input_change',
  context: {
    page: 'dashboard',
    component: 'SearchInput',
    elementType: 'input'
  },
  properties: {
    searchType: 'users',
    queryLength: searchQuery.length
  }
})
```

### 4.4 Event - Eventos Generales

**Cuándo:** Eventos generales como evaluaciones, errores, rendimiento, etc.

```typescript
// Ejemplo: Usuario responde una pregunta
trackEvent({
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

// Ejemplo: Usuario completa una evaluación
trackEvent({
  eventType: 'event',
  eventName: 'evaluation_completed',
  context: {
    page: 'evaluation',
    route: '/evaluation/123'
  },
  properties: {
    evaluationId: 'eval-123',
    totalQuestions: 10,
    answeredQuestions: 10
  },
  metadata: {
    duration: 300000, // 5 minutos en total
    success: true
  }
})

// Ejemplo: Error al cargar datos
trackEvent({
  eventType: 'event',
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

// Ejemplo: Métrica de rendimiento
trackEvent({
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

// Ejemplo: Error al cargar datos
trackEvent({
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
```

---

## 🔄 Paso 5: Finalizar Sesión

Cuando el usuario cierra la app o cierra sesión, envía un evento de fin de sesión.

### Endpoint: `POST /api/tracking/session/end`

```typescript
async function endTrackingSession(sessionId: string, appUsername: string) {
  try {
    const response = await fetch(`${EVA_PULSE_API_URL}/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        appUsername
      })
    })

    // Limpiar session ID del storage
    localStorage.removeItem('eva_pulse_session_id')
    
    return await response.json()
  } catch (error) {
    console.error('Failed to end tracking session:', error)
  }
}

// Uso: Al cerrar sesión o cerrar la app
const sessionId = localStorage.getItem('eva_pulse_session_id')
if (sessionId) {
  await endTrackingSession(sessionId, 'dev')
}
```

---

## 📦 Paso 6: Implementación Completa (Ejemplo React)

Aquí tienes un ejemplo completo de cómo implementar el tracking en una app React:

```typescript
// utils/tracking.ts
const EVA_PULSE_API_URL = 'http://localhost:3000/api/tracking'
const APP_USERNAME = 'dev'

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function initTracking() {
  let sessionId = localStorage.getItem('eva_pulse_session_id')
  
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('eva_pulse_session_id', sessionId)
    
    await fetch(`${EVA_PULSE_API_URL}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        appUsername: APP_USERNAME,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform || 'Unknown',
          screenWidth: window.screen?.width,
          screenHeight: window.screen?.height,
          language: navigator.language || 'es-ES'
        },
        location: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    })
  }
  
  return sessionId
}

export async function trackEvent(event: {
  eventType: string
  eventName: string
  context?: Record<string, any>
  properties?: Record<string, any>
  metadata?: Record<string, any>
}) {
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  if (!sessionId) {
    console.warn('No session ID. Initializing tracking...')
    await initTracking()
    return
  }

  try {
    await fetch(`${EVA_PULSE_API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        appUsername: APP_USERNAME,
        ...event
      })
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

export async function endTracking() {
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  if (sessionId) {
    try {
      await fetch(`${EVA_PULSE_API_URL}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          appUsername: APP_USERNAME
        })
      })
      localStorage.removeItem('eva_pulse_session_id')
    } catch (error) {
      console.error('Failed to end tracking:', error)
    }
  }
}
```

### Uso en Componentes React

```typescript
// App.tsx
import { useEffect } from 'react'
import { initTracking, endTracking } from './utils/tracking'

function App() {
  useEffect(() => {
    // Inicializar tracking al cargar la app
    initTracking()
    
    // Finalizar tracking al cerrar
    return () => {
      endTracking()
    }
  }, [])

  return <YourApp />
}
```

```typescript
// components/SearchButton.tsx
import { trackEvent } from '../utils/tracking'

function SearchButton({ onClick, searchQuery }) {
  const handleClick = () => {
    // Trackear el evento
    trackEvent({
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
        queryLength: searchQuery.length
      }
    })
    
    // Ejecutar la acción
    onClick()
  }

  return <button onClick={handleClick}>Buscar</button>
}
```

---

## ✅ Checklist de Implementación

### Primera Iteración - Eventos Básicos

- [ ] **Configuración inicial**
  - [ ] Definir URL de la API de Eva Pulse
  - [ ] Implementar función para generar Session ID
  - [ ] Guardar Session ID en localStorage

- [ ] **Inicio de sesión**
  - [ ] Enviar evento `session_start` al abrir la app
  - [ ] Incluir información del dispositivo

- [ ] **Eventos de autenticación**
  - [ ] `login_success` cuando el usuario inicia sesión exitosamente
  - [ ] `logout` cuando el usuario cierra sesión

- [ ] **Eventos de navegación**
  - [ ] `page_view` cuando el usuario cambia de página
  - [ ] Incluir ruta y página actual

- [ ] **Eventos de interacción**
  - [ ] `button_click` en botones principales (búsqueda, cerrar sesión, etc.)
  - [ ] `input_focus` cuando el usuario enfoca un input
  - [ ] `input_change` cuando el usuario cambia el valor de un input
  - [ ] Incluir información del elemento interactuado

- [ ] **Eventos generales** (si aplica)
  - [ ] `answer_submitted` cuando responde una pregunta
  - [ ] `evaluation_completed` cuando completa una evaluación
  - [ ] `api_error` cuando hay errores de API
  - [ ] `page_load` para métricas de rendimiento
  - [ ] Incluir información relevante según el tipo de evento

- [ ] **Finalización de sesión**
  - [ ] Enviar evento `session_end` al cerrar la app
  - [ ] Limpiar Session ID del storage

---

## 🔍 Ejemplos de Eventos por Escenario

### Escenario 1: Usuario inicia la app y navega

```typescript
// 1. Al abrir la app
await initTracking() // Genera sessionId y envía session_start

// 2. Usuario inicia sesión
trackEvent({
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

// 3. Usuario navega al dashboard
trackEvent({
  eventType: 'navigation',
  eventName: 'page_view',
  context: {
    page: 'dashboard',
    route: '/dashboard'
  }
})

// 4. Usuario hace click en buscar
trackEvent({
  eventType: 'interaction',
  eventName: 'button_click',
  context: {
    page: 'dashboard',
    component: 'SearchButton',
    elementType: 'button'
  }
})

// 5. Usuario enfoca el input de búsqueda
trackEvent({
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
})

// 6. Usuario escribe en el buscador
trackEvent({
  eventType: 'interaction',
  eventName: 'input_change',
  context: {
    page: 'dashboard',
    component: 'SearchInput'
  },
  properties: {
    searchType: 'users',
    queryLength: 5
  }
})
```

### Escenario 2: Usuario completa una evaluación

```typescript
// 1. Usuario entra a la evaluación
trackEvent({
  eventType: 'navigation',
  eventName: 'page_view',
  context: {
    page: 'evaluation',
    route: '/evaluation/123'
  }
})

// 2. Usuario responde pregunta 1
trackEvent({
  eventType: 'event',
  eventName: 'answer_submitted',
  context: {
    page: 'evaluation',
    component: 'QuestionForm'
  },
  properties: {
    evaluationId: 'eval-123',
    questionId: 'q-1',
    answerType: 'multiple_choice'
  },
  metadata: {
    value: 'option-a',
    success: true
  }
})

// 3. Usuario completa la evaluación
trackEvent({
  eventType: 'event',
  eventName: 'evaluation_completed',
  context: {
    page: 'evaluation',
    route: '/evaluation/123'
  },
  properties: {
    evaluationId: 'eval-123',
    totalQuestions: 10,
    answeredQuestions: 10
  },
  metadata: {
    success: true
  }
})
```

---

## 🛠️ Manejo de Errores

El tracking no debe interrumpir el funcionamiento de tu app. Siempre maneja errores silenciosamente:

```typescript
async function trackEvent(event) {
  try {
    // ... código de tracking
  } catch (error) {
    // Solo loggear, no lanzar error
    console.error('Tracking error (non-blocking):', error)
  }
}
```

---

## 📝 Notas Importantes

1. **Usuario de desarrollo**: Usa `'dev'` como `appUsername` durante desarrollo
2. **Session ID**: Debe persistir durante toda la sesión del usuario
3. **Timestamp**: No es necesario enviarlo, el servidor lo genera automáticamente
4. **Errores**: El tracking nunca debe romper tu aplicación
5. **Performance**: Los eventos se envían de forma asíncrona, no bloquean la UI
6. **Privacidad**: No envíes datos sensibles (contraseñas, tokens, etc.) en los eventos

---

## 🚀 Próximos Pasos

1. Implementa los eventos básicos de la primera iteración
2. Prueba el envío de eventos
3. Verifica en el dashboard de Eva Pulse que los eventos lleguen correctamente
4. Agrega más eventos según necesites

---

## 📞 Soporte

Si tienes dudas sobre la implementación, consulta:
- Documentación completa: `TRACKING_MODEL_PROPOSAL.md`
- API Endpoints: Ver sección de endpoints en este documento

---

**¡Listo para implementar!** 🎉

