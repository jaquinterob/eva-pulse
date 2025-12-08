'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function IntegrationPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            textDecoration: 'none',
          }}
        >
          Eva Pulse
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'var(--foreground)',
              background: 'var(--muted)',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Iniciar Sesión
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '3rem 2rem',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--foreground)',
            }}
          >
            Guía de Integración Técnica
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--muted-foreground)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.75',
            }}
          >
            Documentación técnica para integrar Eva Pulse en tu aplicación
          </p>
        </div>

        {/* Configuración Inicial */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                color: 'var(--foreground)',
              }}
            >
              Configuración Inicial
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                URL Base de la API
              </h3>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>EVA_PULSE_API_URL</span> ={' '}
                  <span style={{ color: 'var(--accent)' }}>'https://tu-dominio.com/api/tracking'</span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>// O en desarrollo:</span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>EVA_PULSE_API_URL</span> ={' '}
                  <span style={{ color: 'var(--accent)' }}>'http://localhost:3000/api/tracking'</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                Autenticación
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.75',
                  marginBottom: '1rem',
                }}
              >
                Todos los endpoints requieren autenticación JWT. Primero obtén un token mediante el endpoint de login:
              </p>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>// Endpoint: POST /api/auth/login</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>response</span> = <span style={{ color: 'var(--muted-foreground)' }}>await</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>fetch</span>(<span style={{ color: 'var(--accent)' }}>'/api/auth/login'</span>, {'{'}
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>method</span>: <span style={{ color: 'var(--accent)' }}>'POST'</span>,
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>headers</span>: {'{'} <span style={{ color: 'var(--accent)' }}>'Content-Type'</span>: <span style={{ color: 'var(--accent)' }}>'application/json'</span> {'}'},
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>body</span>: <span style={{ color: 'var(--primary)' }}>JSON</span>.<span style={{ color: 'var(--primary)' }}>stringify</span>({'{'}
                </div>
                <div style={{ paddingLeft: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>username</span>: <span style={{ color: 'var(--accent)' }}>'tu-usuario'</span>,
                </div>
                <div style={{ paddingLeft: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>password</span>: <span style={{ color: 'var(--accent)' }}>'tu-contraseña'</span>
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
                  {'}'})
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  {'})'}
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>data</span> = <span style={{ color: 'var(--muted-foreground)' }}>await</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>response</span>.<span style={{ color: 'var(--primary)' }}>json</span>()
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>// Usar el token en headers:</span>
                </div>
                <div>
                  <span style={{ color: 'var(--accent)' }}>'Authorization'</span>: <span style={{ color: 'var(--accent)' }}>`Bearer ${'{'}</span><span style={{ color: 'var(--primary)' }}>data</span>.<span style={{ color: 'var(--primary)' }}>data</span>.<span style={{ color: 'var(--primary)' }}>token</span><span style={{ color: 'var(--accent)' }}>}`</span>
                </div>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                Generar Session ID
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.75',
                  marginBottom: '1rem',
                }}
              >
                Cada sesión requiere un ID único (UUID v4 recomendado):
              </p>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>function</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>generateSessionId</span>(): <span style={{ color: 'var(--primary)' }}>string</span> {'{'}
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>return</span>{' '}
                  <span style={{ color: 'var(--accent)' }}>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'</span>
                  .<span style={{ color: 'var(--primary)' }}>replace</span>(<span style={{ color: 'var(--accent)' }}>/[xy]/g</span>, (<span style={{ color: 'var(--primary)' }}>c</span>) =&gt; {'{'}
                </div>
                <div style={{ paddingLeft: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>r</span> = <span style={{ color: 'var(--primary)' }}>Math</span>.<span style={{ color: 'var(--primary)' }}>random</span>() * <span style={{ color: 'var(--accent)' }}>16</span> | <span style={{ color: 'var(--accent)' }}>0</span>
                </div>
                <div style={{ paddingLeft: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>const</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>v</span> = <span style={{ color: 'var(--primary)' }}>c</span> === <span style={{ color: 'var(--accent)' }}>'x'</span> ? <span style={{ color: 'var(--primary)' }}>r</span> : (<span style={{ color: 'var(--primary)' }}>r</span> & <span style={{ color: 'var(--accent)' }}>0x3</span> | <span style={{ color: 'var(--accent)' }}>0x8</span>)
                </div>
                <div style={{ paddingLeft: '2rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>return</span>{' '}
                  <span style={{ color: 'var(--primary)' }}>v</span>.<span style={{ color: 'var(--primary)' }}>toString</span>(<span style={{ color: 'var(--accent)' }}>16</span>)
                </div>
                <div style={{ paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                  {'}'})
                </div>
                <div>
                  {'}'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '2rem',
                color: 'var(--foreground)',
              }}
            >
              Endpoints Principales
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                1. Iniciar Sesión de Tracking
              </h3>
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '6px',
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                POST /api/tracking/session/start
              </div>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{
  "sessionId": "uuid-v4",
  "appUsername": "identificador-usuario",
  "deviceInfo": {
    "userAgent": "string",
    "platform": "string",
    "screenWidth": number,
    "screenHeight": number,
    "language": "string"
  },
  "location": {
    "timezone": "string"
  }
}`}</pre>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                2. Registrar Eventos
              </h3>
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '6px',
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                POST /api/tracking/events
              </div>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{
  "sessionId": "uuid-v4",
  "appUsername": "identificador-usuario",
  "eventType": "authentication" | "interaction" | "navigation" | "event" | "error",
  "eventName": "string",
  "context": {
    "page": "string",
    "component": "string",
    "elementId": "string",
    "route": "string"
  },
  "properties": {},
  "metadata": {}
}`}</pre>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: 'var(--foreground)',
                }}
              >
                3. Finalizar Sesión
              </h3>
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '6px',
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                POST /api/tracking/session/end
              </div>
              <div
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'var(--foreground)',
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{
  "sessionId": "uuid-v4",
  "appUsername": "identificador-usuario"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Ejemplo Completo */}
        <section
          style={{
            marginBottom: '4rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                color: 'var(--foreground)',
              }}
            >
              Ejemplo de Implementación
            </h2>
            <div
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: 'var(--foreground)',
                overflowX: 'auto',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`// 1. Inicializar tracking
async function initTracking() {
  const token = localStorage.getItem('eva-pulse-token')
  const sessionId = generateSessionId()
  
  await fetch('/api/tracking/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: 'identificador-usuario',
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

// 2. Registrar evento
async function trackEvent(eventData) {
  const token = localStorage.getItem('eva-pulse-token')
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  await fetch('/api/tracking/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: 'identificador-usuario',
      eventType: eventData.eventType,
      eventName: eventData.eventName,
      context: eventData.context,
      properties: eventData.properties
    })
  })
}

// 3. Finalizar sesión
async function endTracking() {
  const token = localStorage.getItem('eva-pulse-token')
  const sessionId = localStorage.getItem('eva_pulse_session_id')
  
  await fetch('/api/tracking/session/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      sessionId,
      appUsername: 'identificador-usuario'
    })
  })
}`}</pre>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--foreground)',
              }}
            >
              ¿Necesitas más información?
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--muted-foreground)',
                marginBottom: '2rem',
                lineHeight: '1.75',
              }}
            >
              Para obtener credenciales de acceso, soporte técnico o información adicional sobre la integración, contacta a:
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--primary)' }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:quinteroberrio@gmail.com"
                  style={{
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  quinteroberrio@gmail.com
                </a>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--primary)' }}
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a
                  href="tel:+573155246522"
                  style={{
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  +57 3155246522
                </a>
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'var(--muted)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--muted-foreground)',
                }}
              >
                <strong style={{ color: 'var(--foreground)' }}>Contacto:</strong> JohnQ
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

