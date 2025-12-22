'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import EvaPulseIcon from '@/components/ui/EvaPulseIcon'
import { useState, useEffect, useMemo, useRef } from 'react'

interface InferenceStats {
  average: number
  max: number
  min: number
  total: number
  maxPair: {
    duration: number
    startTime: string
    responseTime: string
    sessionId: string
  } | null
  minPair: {
    duration: number
    startTime: string
    responseTime: string
    sessionId: string
  } | null
}

interface TrackingSession {
  sessionId: string
  appUsername: string
  startTime: Date
  endTime: Date
  duration: number
  eventCount: number
  deviceInfo: {
    platform: string
    language: string
    releaseDate?: string
  }
  isActive: boolean
}

interface TrackingEvent {
  eventId: string
  sessionId: string
  appUsername: string
  eventType: string
  eventName: string
  timestamp: Date
  context: {
    page?: string
    component?: string
    elementType?: string
    route?: string
    url?: string
    elementId?: string
  }
  properties?: Record<string, any>
}

export default function StatsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<InferenceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<TrackingSession | null>(null)

  function handleLogout() {
    logout()
    router.push('/')
  }

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        setError('No hay token de autenticación')
        setLoading(false)
        return
      }

      const response = await fetch('/api/tracking/inference-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Error al cargar estadísticas')
      }
    } catch (err) {
      console.error('Error loading stats:', err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const loadSessionForModal = async (sessionId: string) => {
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        setError('No hay token de autenticación')
        return
      }

      // Obtener eventos para encontrar el appUsername y otros datos
      const eventsResponse = await fetch(`/api/tracking/events?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const eventsData = await eventsResponse.json()
      
      if (eventsData.success && eventsData.data.length > 0) {
        const firstEvent = eventsData.data[0]
        const lastEvent = eventsData.data[eventsData.data.length - 1]
        
        // Crear sesión temporal con los datos disponibles
        const tempSession: TrackingSession = {
          sessionId: sessionId,
          appUsername: firstEvent.appUsername || 'unknown',
          startTime: new Date(firstEvent.timestamp),
          endTime: new Date(lastEvent.timestamp),
          duration: Math.floor(
            (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000
          ),
          eventCount: eventsData.data.length,
          deviceInfo: {
            platform: firstEvent.context?.page || 'Unknown',
            language: 'es-ES',
          },
          isActive: false,
        }

        setSelectedSession(tempSession)
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Error al cargar la sesión')
    }
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(2)
      return `${minutes}m ${seconds}s`
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <AuthGuard>
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .timeline-modal-grid {
            grid-template-columns: 60% 40% !important;
            grid-template-rows: 1fr !important;
          }
          .timeline-modal-timeline {
            border-right: 1px solid var(--border) !important;
            border-bottom: none !important;
          }
          .timeline-modal-details {
            max-height: none !important;
          }
        }
      `}} />
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
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: '1 1 auto',
              minWidth: 0,
            }}
          >
            <EvaPulseIcon 
              size={20} 
              style={{ 
                opacity: 0.85,
                flexShrink: 0,
              }} 
            />
            <h1
              style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Eva Pulse
            </h1>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)',
              }}
            >
              <Link
                href="/dashboard"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                  background: 'transparent',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/stats"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                  background: 'var(--muted)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Estadísticas
              </Link>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {user && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--muted)',
                  borderRadius: '6px',
                  color: 'var(--foreground)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '150px',
                }}
              >
                {user.username}
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                minHeight: '44px',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)'
                e.currentTarget.style.color = 'var(--foreground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--muted-foreground)'
              }}
            >
              Salir
            </button>
          </div>
        </header>

        <div
          style={{
            padding: '1rem',
            maxWidth: '1600px',
            margin: '0 auto',
          }}
        >
          {/* Título y botón de actualizar */}
          <div
            style={{
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Estadísticas de Inferencia
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted-foreground)',
                  margin: 0,
                }}
              >
                Tiempo promedio entre inicio y respuesta de inferencia
              </p>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              style={{
                padding: '0.625rem 1rem',
                minHeight: '44px',
                background: loading ? 'var(--muted)' : 'var(--primary)',
                color: loading ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = '0.9'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = '1'
                }
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  Actualizando...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  Actualizar
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                background: 'var(--muted)',
                border: '1px solid var(--destructive)',
                borderRadius: '8px',
                color: 'var(--destructive)',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Cards de estadísticas */}
          {loading ? (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: '1.125rem',
              }}
            >
              Cargando estadísticas...
            </div>
          ) : stats ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card: Promedio */}
              <StatCard
                title="Tiempo Promedio"
                value={formatDuration(stats.average)}
                subtitle={`${stats.total} evaluaciones`}
                color="var(--primary)"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                }
              />

              {/* Card: Máximo (más lento) */}
              {stats.maxPair && (
                <ClickableStatCard
                  title="Tiempo Máximo"
                  value={formatDuration(stats.max)}
                  subtitle={formatDate(stats.maxPair.startTime)}
                  color="var(--destructive)"
                  icon={
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Tortuga - más lento */}
                      <ellipse cx="12" cy="16" rx="7" ry="3.5" />
                      <ellipse cx="12" cy="14" rx="5" ry="2.5" />
                      <circle cx="9" cy="13.5" r="1" fill="currentColor" />
                      <circle cx="15" cy="13.5" r="1" fill="currentColor" />
                      <path d="M10 11L8 9L6 7" />
                      <path d="M14 11L16 9L18 7" />
                      <path d="M9 11L7 13L5 15" />
                      <path d="M15 11L17 13L19 15" />
                    </svg>
                  }
                  onClick={async () => {
                    await loadSessionForModal(stats.maxPair!.sessionId)
                  }}
                />
              )}

              {/* Card: Mínimo (más rápido) */}
              {stats.minPair && (
                <ClickableStatCard
                  title="Tiempo Mínimo"
                  value={formatDuration(stats.min)}
                  subtitle={formatDate(stats.minPair.startTime)}
                  color="var(--accent)"
                  icon={
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Premio/Trofeo - más rápido */}
                      <path d="M6 9H4a2 2 0 0 1 0-4h2" />
                      <path d="M18 9h2a2 2 0 0 0 0-4h-2" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      <path d="M12 6V2" />
                      <path d="M8 5h8" />
                      <circle cx="12" cy="9" r="1" fill="currentColor" />
                    </svg>
                  }
                  onClick={async () => {
                    await loadSessionForModal(stats.minPair!.sessionId)
                  }}
                />
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: '1.125rem',
              }}
            >
              No hay datos de inferencia disponibles
            </div>
          )}
        </div>

        {/* Modal de Timeline */}
        {selectedSession && (
          <TimelineModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            formatDate={(date: Date) => {
              return new Date(date).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            }}
            formatDuration={(seconds: number) => {
              const ms = seconds * 1000
              if (ms < 1000) {
                return `${Math.round(ms)}ms`
              } else if (ms < 60000) {
                return `${(ms / 1000).toFixed(2)}s`
              } else {
                const minutes = Math.floor(ms / 60000)
                const secs = ((ms % 60000) / 1000).toFixed(2)
                return `${minutes}m ${secs}s`
              }
            }}
          />
        )}
      </main>
    </AuthGuard>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  color: string
  icon?: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: '2rem',
        background: 'var(--card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
      }}
    >
      {icon && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: color,
            opacity: 0.2,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {icon && (
          <div
            style={{
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
            }}
          >
            {icon}
          </div>
        )}
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 700,
          color: color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted-foreground)',
          marginTop: '0.5rem',
        }}
      >
        {subtitle}
      </div>
    </div>
  )
}

function ClickableStatCard({
  title,
  value,
  subtitle,
  color,
  icon,
  onClick,
}: {
  title: string
  value: string
  subtitle: string
  color: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '2rem',
        background: 'var(--card)',
        borderRadius: '12px',
        border: `2px solid ${color}`,
        boxShadow: `0 4px 12px ${color}20, 0 1px 3px rgba(0,0,0,0.05)`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 20px ${color}30, 0 2px 6px rgba(0,0,0,0.1)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}20, 0 1px 3px rgba(0,0,0,0.05)`
      }}
    >
      {/* Icono en la esquina superior derecha */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          color: color,
          opacity: 0.3,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 700,
          color: color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted-foreground)',
          marginTop: '0.5rem',
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          color: color,
          fontWeight: 500,
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
        </svg>
        Ver trazas
      </div>
    </div>
  )
}

function TimelineModal({ session, onClose, formatDate, formatDuration }: {
  session: TrackingSession
  onClose: () => void
  formatDate: (date: Date) => string
  formatDuration: (seconds: number) => string
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [sessionEvents, setSessionEvents] = useState<TrackingEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [timeAgo, setTimeAgo] = useState<string>('')
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollToEndRef = useRef<boolean>(false)

  // Función para cargar eventos de la sesión
  const loadEvents = async () => {
    setLoadingEvents(true)
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        console.error('No hay token de autenticación')
        setLoadingEvents(false)
        return
      }

      const response = await fetch(`/api/tracking/events?sessionId=${session.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        const events = data.data.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }))
        setSessionEvents(events)
        setLastUpdate(new Date())
        
        if (events.length > 0) {
          const sortedEvents = [...events].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          const lastEvent = sortedEvents[0]
          shouldScrollToEndRef.current = true
          setSelectedEventId(lastEvent.eventId)
        }
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 60) {
      return `hace ${diffSecs} segundo${diffSecs !== 1 ? 's' : ''}`
    } else if (diffMins < 60) {
      return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`
    } else if (diffHours < 24) {
      return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
    }
  }

  useEffect(() => {
    if (!lastUpdate) return
    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastUpdate))
    }
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  useEffect(() => {
    loadEvents()
  }, [session.sessionId])

  useEffect(() => {
    if (!loadingEvents && timelineContainerRef.current && selectedEventId && sessionEvents.length > 0 && shouldScrollToEndRef.current) {
      setTimeout(() => {
        if (timelineContainerRef.current) {
          timelineContainerRef.current.scrollTo({
            top: timelineContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
          shouldScrollToEndRef.current = false
        }
      }, 200)
    }
  }, [loadingEvents, selectedEventId, sessionEvents.length])
  
  const sortedEvents = useMemo(() => {
    return [...sessionEvents].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [sessionEvents])

  const isLoginEventCheck = (event: TrackingEvent | null): boolean => {
    if (!event || event.eventType !== 'authentication') return false
    const eventName = event.eventName.toLowerCase()
    return eventName.includes('login') || eventName === 'authenticated' || eventName === 'signin'
  }

  const groupedEvents = useMemo(() => {
    const groups: Array<{ authEvent: TrackingEvent | null; events: TrackingEvent[] }> = []
    let currentGroup: { authEvent: TrackingEvent | null; events: TrackingEvent[] } | null = null

    const isLoginEvent = (event: TrackingEvent): boolean => {
      if (event.eventType !== 'authentication') return false
      const eventName = event.eventName.toLowerCase()
      return eventName.includes('login') || eventName === 'authenticated' || eventName === 'signin'
    }

    sortedEvents.forEach((event) => {
      if (event.eventType === 'authentication' && isLoginEvent(event)) {
        if (currentGroup) {
          groups.push(currentGroup)
        }
        currentGroup = {
          authEvent: event,
          events: [event]
        }
      } else {
        if (!currentGroup) {
          currentGroup = {
            authEvent: null,
            events: []
          }
        }
        currentGroup.events.push(event)
      }
    })

    if (currentGroup) {
      groups.push(currentGroup)
    }

    return groups
  }, [sortedEvents])

  const selectedEvent = useMemo(() => {
    return sortedEvents.find(e => e.eventId === selectedEventId) || null
  }, [selectedEventId, sortedEvents])

  const getRelativeTime = (eventTimestamp: Date, sessionStart: Date): number => {
    return Math.floor((new Date(eventTimestamp).getTime() - new Date(sessionStart).getTime()) / 1000)
  }

  const formatRelativeTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getEventTypeColor = (eventType: string): string => {
    const colors: Record<string, string> = {
      authentication: '#8b5cf6',
      interaction: '#10b981',
      event: '#f59e0b',
      navigation: '#2563eb',
      error: 'var(--destructive)'
    }
    return colors[eventType] || 'var(--muted-foreground)'
  }

  const getEventTypeIcon = (eventType: string) => {
    const iconSize = 14
    const iconColor = getEventTypeColor(eventType)

    switch (eventType) {
      case 'authentication':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )
      case 'interaction':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      case 'event':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      case 'navigation':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
          </svg>
        )
      case 'error':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
      default:
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
    }
  }

  const formatSessionDate = (date: Date): string => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(sortedEvents[0].eventId)
    }
  }, [sortedEvents, selectedEventId])

  const copyToClipboard = async (value: any, key: string) => {
    try {
      const textToCopy = typeof value === 'object' && value !== null 
        ? JSON.stringify(value, null, 2) 
        : String(value)
      await navigator.clipboard.writeText(textToCopy)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        padding: '0',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          background: 'var(--background)',
          borderRadius: '0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: 'var(--card)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h2
              style={{
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
                fontWeight: 700,
                color: 'var(--foreground)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Timeline de Sesión
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
              {session.appUsername} • {formatSessionDate(session.startTime)} • {formatDuration(session.duration)} • {loadingEvents ? '...' : sessionEvents.length} eventos
              {session.deviceInfo?.releaseDate && (
                <span style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  • <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>Release:</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>{session.deviceInfo.releaseDate}</span>
                </span>
              )}
              {lastUpdate && (
                <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem' }}>
                  • Última actualización: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({timeAgo})
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={loadEvents}
              disabled={loadingEvents}
              style={{
                padding: '0.5rem',
                background: loadingEvents ? 'var(--muted)' : 'var(--primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingEvents ? 'not-allowed' : 'pointer',
                color: loadingEvents ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                fontSize: '1rem',
                lineHeight: 1,
                minWidth: '44px',
                minHeight: '44px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                opacity: loadingEvents ? 0.6 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!loadingEvents) {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingEvents) {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
              title="Recargar eventos"
            >
              {loadingEvents ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                background: 'var(--muted)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--foreground)',
                fontSize: '1.5rem',
                lineHeight: 1,
                minWidth: '44px',
                minHeight: '44px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--destructive)'
                e.currentTarget.style.color = 'var(--destructive-foreground)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--muted)'
                e.currentTarget.style.color = 'var(--foreground)'
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div
          className="timeline-modal-grid"
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr auto',
            overflow: 'hidden',
            background: 'var(--background)',
          }}
        >
          <div
            ref={timelineContainerRef}
            className="timeline-modal-timeline"
            style={{
              overflowY: 'auto',
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {loadingEvents ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '1.125rem',
                }}
              >
                Cargando eventos...
              </div>
            ) : sortedEvents.length === 0 ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '1.125rem',
                }}
              >
                No hay eventos en esta sesión
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 'clamp(2.5rem, 5vw, 3rem)' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 'clamp(19px, 4vw, 24px)',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, var(--primary) 100%)',
                    borderRadius: '2px',
                    zIndex: 1,
                  }}
                />

                {groupedEvents.map((group, groupIndex) => {
                  const showNewSessionHeader = group.authEvent && isLoginEventCheck(group.authEvent)

                  return (
                    <div key={groupIndex}>
                      {showNewSessionHeader && (
                        <div
                          style={{
                            position: 'relative',
                            marginBottom: '1.5rem',
                            marginTop: groupIndex > 0 ? '2rem' : '0',
                            paddingTop: groupIndex > 0 ? '1.5rem' : '0',
                            borderTop: groupIndex > 0 ? '2px solid var(--border)' : 'none',
                          }}
                        >
                          {groupIndex > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                left: '-3rem',
                                top: '-2px',
                                width: '3rem',
                                height: '2px',
                                background: 'var(--border)',
                              }}
                            />
                          )}
                          <div
                            style={{
                              marginBottom: '1rem',
                              paddingLeft: '1.5rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--muted-foreground)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Nueva Sesión
                            </div>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                color: 'var(--foreground)',
                                fontWeight: 500,
                              }}
                            >
                              {formatSessionDate(group.authEvent!.timestamp)}
                            </div>
                          </div>
                        </div>
                      )}

                    {group.events.map((event) => {
                      const isSelected = selectedEventId === event.eventId
                      const isHovered = hoveredEventId === event.eventId
                      const eventColor = getEventTypeColor(event.eventType)
                      const pointSize = isSelected || isHovered ? 16 : 12

                      return (
                        <div
                          key={event.eventId}
                          style={{
                            position: 'relative',
                            marginBottom: '1rem',
                            paddingLeft: '1.5rem',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedEventId(event.eventId)}
                          onMouseEnter={() => setHoveredEventId(event.eventId)}
                          onMouseLeave={() => setHoveredEventId(null)}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: '-20px',
                              top: '2px',
                              width: `${pointSize}px`,
                              height: `${pointSize}px`,
                              marginLeft: `-${pointSize / 2}px`,
                              borderRadius: '50%',
                              background: eventColor,
                              border: '3px solid var(--background)',
                              boxShadow: isSelected || isHovered
                                ? `0 0 0 6px ${eventColor}40, 0 0 0 10px ${eventColor}20, 0 4px 12px ${eventColor}60`
                                : `0 0 0 3px ${eventColor}40, 0 0 0 6px ${eventColor}20, 0 2px 6px ${eventColor}40`,
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box',
                              zIndex: 10,
                            }}
                          />

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              paddingTop: '0.1em',
                              marginLeft: '-0.5rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                fontSize: '0.75rem',
                                color: isSelected ? eventColor : 'var(--muted-foreground)',
                                fontWeight: isSelected ? 600 : 500,
                                minWidth: '85px',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <span 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  opacity: isSelected ? 1 : 0.8,
                                  transition: 'opacity 0.2s ease',
                                }}
                              >
                                {getEventTypeIcon(event.eventType)}
                              </span>
                              {new Date(event.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                            <div
                              style={{
                                fontSize: '0.9375rem',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {event.eventName.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  )
                })}
              </div>
            )}
          </div>

          <div
            className="timeline-modal-details"
            style={{
              overflowY: 'auto',
              padding: '1rem',
              background: 'var(--card)',
              maxHeight: '50vh',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {selectedEvent ? (
              <div>
                <div
                  style={{
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '2px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.375rem 0.875rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: `${getEventTypeColor(selectedEvent.eventType)}20`,
                        color: getEventTypeColor(selectedEvent.eventType),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {selectedEvent.eventType}
                    </span>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        margin: 0,
                      }}
                    >
                      {selectedEvent.eventName.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {formatDate(selectedEvent.timestamp)} • +{formatRelativeTime(getRelativeTime(selectedEvent.timestamp, session.startTime))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Contexto
                  </h4>
                  <div
                    style={{
                      background: 'var(--background)',
                      borderRadius: '8px',
                      padding: '1rem',
                    }}
                  >
                    {selectedEvent.context.page && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Página
                        </div>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'var(--foreground)',
                          }}
                        >
                          {selectedEvent.context.page}
                        </div>
                      </div>
                    )}
                    {selectedEvent.context.component && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Componente
                        </div>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'var(--foreground)',
                          }}
                        >
                          {selectedEvent.context.component}
                        </div>
                      </div>
                    )}
                    {selectedEvent.context.elementType && (
                      <div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Tipo de Elemento
                        </div>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'var(--foreground)',
                          }}
                        >
                          {selectedEvent.context.elementType}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEvent.properties && Object.keys(selectedEvent.properties).length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--muted-foreground)',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Propiedades
                    </h4>
                    <div
                      style={{
                        background: 'var(--background)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {Object.entries(selectedEvent.properties).map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            paddingBottom: '0.75rem',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--muted-foreground)',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span>{key}</span>
                            {key.toLowerCase() === 'answers' && (
                              <button
                                onClick={() => copyToClipboard(value, key)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: copiedKey === key ? 'var(--primary)' : 'var(--muted-foreground)',
                                  transition: 'color 0.2s',
                                  borderRadius: '4px',
                                }}
                                onMouseEnter={(e) => {
                                  if (copiedKey !== key) {
                                    e.currentTarget.style.color = 'var(--foreground)'
                                    e.currentTarget.style.background = 'var(--muted)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (copiedKey !== key) {
                                    e.currentTarget.style.color = 'var(--muted-foreground)'
                                    e.currentTarget.style.background = 'transparent'
                                  }
                                }}
                                title={copiedKey === key ? '¡Copiado!' : 'Copiar valor'}
                              >
                                {copiedKey === key ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 500,
                              color: 'var(--foreground)',
                            }}
                          >
                            {typeof value === 'object' && value !== null ? (
                              <pre
                                style={{
                                  margin: 0,
                                  padding: '0.5rem',
                                  background: 'var(--muted)',
                                  borderRadius: '4px',
                                  fontSize: '0.8125rem',
                                  overflow: 'auto',
                                  maxHeight: '200px',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              String(value)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '1.125rem',
                }}
              >
                Selecciona un evento para ver sus detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

