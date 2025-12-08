# 🔄 Cambios en la Implementación de la API de Tracking

## 📋 Resumen de Cambios

El sistema ahora requiere que se envíe el **`appUsername`** desde el cliente en todos los requests. Este `appUsername` es el nombre del usuario que se autenticó en la aplicación (puede venir de un input de usuario en la app) y **NO** se toma del token JWT.

---

## ✅ Cambios Requeridos en el Cliente

### 1. **Iniciar Sesión de Tracking** 
`POST /api/tracking/session/start`

#### ✅ CORRECTO (Implementación actual):
```javascript
// El appUsername debe venir del input de usuario en la app
const appUsername = document.getElementById('user-input').value; // o desde donde lo tengas

await fetch('/api/tracking/session/start', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ⚠️ El token es OBLIGATORIO
  },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    appUsername: appUsername,  // ✅ REQUERIDO - Nombre del usuario de la app
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,  // ✅ Requerido
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language  // ✅ Requerido
    },
    location: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })
})
```

**Campos requeridos:**
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario que se autenticó en la app
- ✅ `deviceInfo` (requerido)
  - ✅ `platform` (requerido)
  - ✅ `language` (requerido)
- ✅ El token de autenticación es **obligatorio** en el header

---

### 2. **Registrar Eventos**
`POST /api/tracking/events`

#### ✅ CORRECTO (Implementación actual):
```javascript
// El appUsername debe venir del input de usuario en la app
const appUsername = document.getElementById('user-input').value; // o desde donde lo tengas

await fetch('/api/tracking/events', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ⚠️ El token es OBLIGATORIO
  },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    appUsername: appUsername,  // ✅ REQUERIDO - Nombre del usuario de la app
    eventType: 'interaction',
    eventName: 'button_click',
    context: {
      page: 'dashboard',
      component: 'SearchButton'
    },
    properties: {
      buttonText: 'Buscar'
    }
  })
})
```

**Campos requeridos:**
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario que se autenticó en la app
- ✅ `eventType` (requerido)
- ✅ `eventName` (requerido)
- ✅ El token de autenticación es **obligatorio** en el header

---

### 3. **Finalizar Sesión de Tracking**
`POST /api/tracking/session/end`

#### ✅ CORRECTO (Implementación actual):
```javascript
// El appUsername debe venir del input de usuario en la app
const appUsername = document.getElementById('user-input').value; // o desde donde lo tengas

await fetch('/api/tracking/session/end', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ⚠️ El token es OBLIGATORIO
  },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    appUsername: appUsername  // ✅ REQUERIDO - Nombre del usuario de la app
  })
})
```

**Campos requeridos:**
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario que se autenticó en la app
- ✅ El token de autenticación es **obligatorio** en el header

---

### 4. **Obtener Sesiones**
`GET /api/tracking/sessions`

#### ✅ CORRECTO (Implementación actual):
```javascript
// Opción 1: Obtener todas las sesiones (sin filtro de usuario)
const url = new URL('/api/tracking/sessions', window.location.origin)
url.searchParams.set('startDate', '2024-01-01T00:00:00Z')
url.searchParams.set('endDate', '2024-01-31T23:59:59Z')

await fetch(url.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 2: Buscar sesiones de un usuario específico
const url2 = new URL('/api/tracking/sessions', window.location.origin)
url2.searchParams.set('appUsername', 'nombre_usuario')  // ✅ Usar 'appUsername'
url2.searchParams.set('startDate', '2024-01-01T00:00:00Z')
url2.searchParams.set('endDate', '2024-01-31T23:59:59Z')

await fetch(url2.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 3: Buscar todas las sesiones de un usuario (sin rango de fechas)
const url3 = new URL('/api/tracking/sessions', window.location.origin)
url3.searchParams.set('appUsername', 'nombre_usuario')

await fetch(url3.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})
```

**Parámetros:**
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario de la app
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas
- ✅ El token de autenticación es **obligatorio** en el header

---

### 5. **Obtener Eventos**
`GET /api/tracking/events`

#### ✅ CORRECTO (Implementación actual):
```javascript
// Opción 1: Obtener eventos de una sesión específica
const url = new URL('/api/tracking/events', window.location.origin)
url.searchParams.set('sessionId', '550e8400-e29b-41d4-a716-446655440000')
// Opcional: filtrar por appUsername
url.searchParams.set('appUsername', 'nombre_usuario')

await fetch(url.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 2: Buscar eventos de un usuario específico
const url2 = new URL('/api/tracking/events', window.location.origin)
url2.searchParams.set('appUsername', 'nombre_usuario')

await fetch(url2.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 3: Obtener eventos por rango de fechas
const url3 = new URL('/api/tracking/events', window.location.origin)
url3.searchParams.set('startDate', '2024-01-01T00:00:00Z')
url3.searchParams.set('endDate', '2024-01-31T23:59:59Z')
// Opcional: filtrar por appUsername
url3.searchParams.set('appUsername', 'nombre_usuario')

await fetch(url3.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 4: Obtener eventos por tipo
const url4 = new URL('/api/tracking/events', window.location.origin)
url4.searchParams.set('eventType', 'interaction')
// Opcional: filtrar por appUsername
url4.searchParams.set('appUsername', 'nombre_usuario')

await fetch(url4.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})
```

**Parámetros:**
- ✅ `sessionId` (opcional) - Filtrar por ID de sesión
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario de la app
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas
- ✅ `eventType` (opcional) - Filtrar por tipo de evento
- ✅ El token de autenticación es **obligatorio** en el header

---

### 6. **Obtener Estadísticas**
`GET /api/tracking/stats`

#### ✅ CORRECTO (Implementación actual):
```javascript
// Opción 1: Estadísticas globales (todos los usuarios)
const url = new URL('/api/tracking/stats', window.location.origin)

await fetch(url.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 2: Estadísticas por rango de fechas
const url2 = new URL('/api/tracking/stats', window.location.origin)
url2.searchParams.set('startDate', '2024-01-01T00:00:00Z')
url2.searchParams.set('endDate', '2024-01-31T23:59:59Z')

await fetch(url2.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 3: Estadísticas de un usuario específico
const url3 = new URL('/api/tracking/stats', window.location.origin)
url3.searchParams.set('appUsername', 'nombre_usuario')  // ✅ Usar 'appUsername'

await fetch(url3.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})

// Opción 4: Estadísticas de un usuario en un rango de fechas
const url4 = new URL('/api/tracking/stats', window.location.origin)
url4.searchParams.set('appUsername', 'nombre_usuario')
url4.searchParams.set('startDate', '2024-01-01T00:00:00Z')
url4.searchParams.set('endDate', '2024-01-31T23:59:59Z')

await fetch(url4.toString(), {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
})
```

**Parámetros:**
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario de la app
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas
- ✅ El token de autenticación es **obligatorio** en el header

---

## 🔑 Puntos Importantes

### ✅ **Obligatorio:**
1. **Token de autenticación**: Todos los endpoints requieren el header `Authorization: Bearer <token>`
2. **`appUsername` en POST**: Debe enviarse en el body de todos los requests POST (session/start, events, session/end)
3. **`appUsername` en GET**: Es opcional en los requests GET, pero permite filtrar por usuario específico

### ⚠️ **Comportamiento:**
- El `appUsername` es el nombre del usuario que se autenticó en la aplicación (puede venir de un input de usuario)
- El `appUsername` **NO** se toma del token JWT, debe enviarse explícitamente desde el cliente
- Las búsquedas y agrupaciones se hacen por el `appUsername` enviado
- Si no se especifica `appUsername` en los GET, se devuelven todos los datos (sin filtro)

### 📝 **Ejemplo de Implementación Completa:**

```javascript
// Obtener el appUsername del input de usuario en la app
function getAppUsername() {
  // Ejemplo: obtener del input
  const userInput = document.getElementById('user-input');
  return userInput ? userInput.value : 'usuario_default';
  
  // O también puede venir de:
  // - localStorage.getItem('app_username')
  // - Un estado de React/Vue
  // - Un contexto de la aplicación
  // - etc.
}

// 1. Inicializar tracking (al iniciar la app)
async function initTracking() {
  const token = localStorage.getItem('eva_pulse_token')
  const appUsername = getAppUsername()  // ✅ Obtener del input de usuario
  const sessionId = generateSessionId()
  localStorage.setItem('eva_pulse_session_id', sessionId)
  
  await fetch('/api/tracking/session/start', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: appUsername,  // ✅ REQUERIDO
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language
      },
      location: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  })
  
  return sessionId
}

// 2. Registrar eventos (durante la sesión)
async function trackEvent(eventData) {
  const token = localStorage.getItem('eva_pulse_token')
  const appUsername = getAppUsername()  // ✅ Obtener del input de usuario
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  await fetch('/api/tracking/events', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: appUsername,  // ✅ REQUERIDO
      eventType: eventData.eventType,
      eventName: eventData.eventName,
      context: eventData.context,
      properties: eventData.properties,
      metadata: eventData.metadata
    })
  })
}

// 3. Finalizar sesión (al cerrar la app)
async function endTracking() {
  const token = localStorage.getItem('eva_pulse_token')
  const appUsername = getAppUsername()  // ✅ Obtener del input de usuario
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  await fetch('/api/tracking/session/end', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: appUsername  // ✅ REQUERIDO
    })
  })
  
  localStorage.removeItem('eva_pulse_session_id')
}
```

---

## 🚨 Errores Comunes

### Error 400: "appUsername es requerido"
**Causa**: Falta el campo `appUsername` en el body del request
**Solución**: Asegúrate de incluir `appUsername` en todos los requests POST (session/start, events, session/end)

### Error 401: "No autorizado"
**Causa**: Falta el token de autenticación o es inválido
**Solución**: Asegúrate de incluir el header `Authorization: Bearer <token>`

### Error 400: "Parámetros insuficientes"
**Causa**: Faltan campos requeridos (sessionId, eventType, eventName, appUsername, etc.)
**Solución**: Revisa que todos los campos requeridos estén presentes en el body

---

## 📚 Resumen de Campos Requeridos

### POST /api/tracking/session/start
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario de la app
- ✅ `deviceInfo` (requerido)
  - ✅ `platform` (requerido)
  - ✅ `language` (requerido)
- ✅ `location` (opcional)

### POST /api/tracking/events
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario de la app
- ✅ `eventType` (requerido)
- ✅ `eventName` (requerido)
- ✅ `context` (opcional)
- ✅ `properties` (opcional)
- ✅ `metadata` (opcional)

### POST /api/tracking/session/end
- ✅ `sessionId` (requerido)
- ✅ `appUsername` (requerido) - Nombre del usuario de la app

### GET /api/tracking/sessions
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas

### GET /api/tracking/events
- ✅ `sessionId` (opcional) - Filtrar por ID de sesión
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas
- ✅ `eventType` (opcional) - Filtrar por tipo de evento
- ⚠️ Se requiere al menos uno de los parámetros anteriores

### GET /api/tracking/stats
- ✅ `appUsername` (opcional) - Filtrar por nombre de usuario
- ✅ `startDate` y `endDate` (opcionales) - Filtrar por rango de fechas

