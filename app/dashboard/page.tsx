'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  getMockSessions,
  getSessionsByDateRange,
  getSessionsByUser,
  getUniqueUsers,
  getMockEvents,
  getEventsBySession,
  type MockSession,
  type MockEvent
} from '@/lib/mock-data/trackingData'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  
  // Estado para el rango de fechas
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7) // Últimos 7 días por defecto
    date.setHours(0, 0, 0, 0)
    return date.toISOString().slice(0, 16) // Formato para input datetime-local
  })
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setHours(23, 59, 59, 999)
    return date.toISOString().slice(0, 16)
  })

  // Convertir strings a Date para el filtrado
  const startDateObj = useMemo(() => new Date(startDate), [startDate])
  const endDateObj = useMemo(() => {
    const date = new Date(endDate)
    date.setHours(23, 59, 59, 999)
    return date
  }, [endDate])

  // Estado para búsqueda de usuario
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Estado para el modal de timeline
  const [selectedSessionForTimeline, setSelectedSessionForTimeline] = useState<MockSession | null>(null)

  const allUsers = getUniqueUsers()

  function handleLogout() {
    logout()
    router.push('/')
  }

  // Filtrar usuarios según la búsqueda (a partir de 2 letras)
  const filteredUsers = useMemo(() => {
    if (searchQuery.length < 2) return []
    const query = searchQuery.toLowerCase()
    return allUsers.filter(username => 
      username.toLowerCase().includes(query)
    ).slice(0, 10) // Limitar a 10 resultados
  }, [searchQuery, allUsers])

  // Filtrar sesiones según el rango de fechas y usuario seleccionado
  const filteredSessions = useMemo(() => {
    let sessions = getSessionsByDateRange(startDateObj, endDateObj)
    
    // Si hay un usuario seleccionado, filtrar por ese usuario
    if (selectedUser) {
      sessions = sessions.filter(s => s.appUsername === selectedUser)
    }
    
    return sessions
  }, [startDateObj, endDateObj, selectedUser])

  // Manejar selección de usuario
  const handleUserSelect = (username: string) => {
    setSelectedUser(username)
    setSearchQuery(username)
    setShowAutocomplete(false)
    setHighlightedIndex(-1)
  }

  // Manejar teclas en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredUsers.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleUserSelect(filteredUsers[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
      setHighlightedIndex(-1)
    }
  }

  // Cerrar autocomplete al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Limpiar filtro de usuario
  const clearUserFilter = () => {
    setSelectedUser(null)
    setSearchQuery('')
    setShowAutocomplete(false)
  }

  // Calcular métricas
  const totalSessions = filteredSessions.length
  const uniqueUsers = useMemo(() => {
    return new Set(filteredSessions.map(s => s.appUsername)).size
  }, [filteredSessions])

  // Últimas sesiones (ordenadas por fecha, más recientes primero)
  const latestSessions = useMemo(() => {
    return [...filteredSessions]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }, [filteredSessions])

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <AuthGuard>
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        {/* Header estilo Amplitude */}
        <header
          style={{
            padding: '0.75rem 1.5rem',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
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
                  background: 'var(--muted)',
                  fontWeight: 500,
                }}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
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
            padding: '2rem',
            maxWidth: '1600px',
            margin: '0 auto',
          }}
        >
          {/* Filtros y métricas en la misma línea */}
          <div
            style={{
              marginBottom: '2rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            {/* Buscador de usuario */}
            <div
              style={{
                position: 'relative',
                flex: '0 0 auto',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)',
                  marginBottom: '0.375rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Buscar Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowAutocomplete(e.target.value.length >= 2)
                    setHighlightedIndex(-1)
                    if (e.target.value.length < 2) {
                      setSelectedUser(null)
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    if (searchQuery.length >= 2) {
                      setShowAutocomplete(true)
                    }
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Escribe al menos 2 letras para buscar..."
                  style={{
                    width: '100%',
                    minWidth: '250px',
                    padding: '0.75rem 1rem',
                    paddingRight: selectedUser ? '2.5rem' : '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
                {selectedUser && (
                  <button
                    onClick={clearUserFilter}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--muted)',
                      border: 'none',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--muted-foreground)',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--destructive)'
                      e.currentTarget.style.color = 'var(--destructive-foreground)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--muted)'
                      e.currentTarget.style.color = 'var(--muted-foreground)'
                    }}
                    title="Limpiar filtro"
                  >
                    ×
                  </button>
                )}
                
                {/* Autocomplete dropdown */}
                {showAutocomplete && filteredUsers.length > 0 && (
                  <div
                    ref={autocompleteRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      minWidth: '250px',
                      marginTop: '0.25rem',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredUsers.map((username, index) => (
                      <div
                        key={username}
                        onClick={() => handleUserSelect(username)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          background: highlightedIndex === index ? 'var(--muted)' : 'transparent',
                          borderBottom: index < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--foreground)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {username}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {(() => {
                            const start = new Date(startDate)
                            const end = new Date(endDate)
                            end.setHours(23, 59, 59, 999)
                            const dateFiltered = getSessionsByDateRange(start, end)
                            return dateFiltered.filter(s => s.appUsername === username).length
                          })()} sesiones
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selector de fechas */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '0 0 auto' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    marginBottom: '0.375rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Desde
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      paddingRight: '2.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontSize: '0.875rem',
                      minWidth: '200px',
                      width: '100%',
                    }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      opacity: 0.6,
                    }}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    marginBottom: '0.375rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Hasta
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      paddingRight: '2.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontSize: '0.875rem',
                      minWidth: '200px',
                      width: '100%',
                    }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      opacity: 0.6,
                    }}
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Badge de usuario seleccionado */}
          {selectedUser && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                display: 'inline-block',
              }}
            >
              Filtrando por: <strong>{selectedUser}</strong>
            </div>
          )}

          {/* Últimas sesiones en formato de cards */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    margin: '0 0 0.25rem 0',
                  }}
                >
                  Últimas Sesiones
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--muted-foreground)',
                    margin: 0,
                  }}
                >
                  {latestSessions.length} {latestSessions.length === 1 ? 'sesión' : 'sesiones'} en el rango seleccionado
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <CompactMetricCard
                  title="Sesiones"
                  value={totalSessions}
                  color="var(--primary)"
                />
                <CompactMetricCard
                  title="Usuarios"
                  value={uniqueUsers}
                  color="#8b5cf6"
                />
              </div>
            </div>
            <div style={{ padding: '1rem' }}>
              {latestSessions.length === 0 ? (
                <div
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  No hay sesiones en el rango de fechas seleccionado
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '0.75rem',
                  }}
                >
                  {latestSessions.map((session) => (
                    <SessionCard
                      key={session.sessionId}
                      session={session}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                      onClick={() => setSelectedSessionForTimeline(session)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Timeline */}
        {selectedSessionForTimeline && (
          <TimelineModal
            session={selectedSessionForTimeline}
            onClose={() => setSelectedSessionForTimeline(null)}
            formatDate={formatDate}
            formatDuration={formatDuration}
          />
        )}
      </main>
    </AuthGuard>
  )
}

function CompactMetricCard({ title, value, color }: {
  title: string
  value: number
  color: string
}) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        background: 'var(--card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        minWidth: '120px',
      }}
    >
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--muted-foreground)',
          marginBottom: '0.375rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: color,
          lineHeight: 1,
        }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function TimelineModal({ session, onClose, formatDate, formatDuration }: {
  session: MockSession
  onClose: () => void
  formatDate: (date: Date) => string
  formatDuration: (seconds: number) => string
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const allEvents = getMockEvents()
  const sessionEvents = getEventsBySession(session.sessionId)
  
  const sortedEvents = useMemo(() => {
    return [...sessionEvents].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [sessionEvents])

  // Agrupar eventos por sub-sesiones basadas en eventos de autenticación
  const groupedEvents = useMemo(() => {
    const groups: Array<{ authEvent: MockEvent | null; events: MockEvent[] }> = []
    let currentGroup: { authEvent: MockEvent | null; events: MockEvent[] } | null = null

    sortedEvents.forEach((event) => {
      if (event.eventType === 'authentication') {
        // Si ya hay un grupo, guardarlo
        if (currentGroup) {
          groups.push(currentGroup)
        }
        // Crear nuevo grupo con este evento de autenticación
        currentGroup = {
          authEvent: event,
          events: [event]
        }
      } else {
        // Si no hay grupo actual, crear uno sin evento de autenticación
        if (!currentGroup) {
          currentGroup = {
            authEvent: null,
            events: []
          }
        }
        // Agregar evento al grupo actual
        currentGroup.events.push(event)
      }
    })

    // Agregar el último grupo si existe
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
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )
      case 'interaction':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      case 'event':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      case 'navigation':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
          </svg>
        )
      case 'error':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
      default:
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

  // Seleccionar el primer evento por defecto
  useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(sortedEvents[0].eventId)
    }
  }, [sortedEvents, selectedEventId])

  // Cerrar con Escape
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
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
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--card)',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Timeline de Sesión
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              {session.appUsername} • {formatSessionDate(session.startTime)} • {formatDuration(session.duration)} • {sessionEvents.length} eventos
            </div>
          </div>
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
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
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

        {/* Contenido dividido en 60-40 */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            overflow: 'hidden',
            background: 'var(--background)',
          }}
        >
          {/* Mitad izquierda: Timeline */}
          <div
            style={{
              overflowY: 'auto',
              padding: '2rem',
              borderRight: '1px solid var(--border)',
            }}
          >
            {sortedEvents.length === 0 ? (
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
              <div style={{ position: 'relative', paddingLeft: '3rem' }}>
                {/* Línea vertical - centrada en 25px */}
                <div
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, var(--primary) 100%)',
                    borderRadius: '2px',
                    zIndex: 1,
                  }}
                />

                {/* Grupos de eventos por sub-sesión */}
                {groupedEvents.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* Separador de sub-sesión si hay evento de autenticación */}
                    {group.authEvent && (
                      <div
                        style={{
                          position: 'relative',
                          marginBottom: '1.5rem',
                          marginTop: groupIndex > 0 ? '2rem' : '0',
                          paddingTop: groupIndex > 0 ? '1.5rem' : '0',
                          borderTop: groupIndex > 0 ? '2px solid var(--border)' : 'none',
                        }}
                      >
                        {/* Línea horizontal separadora */}
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
                        {/* Encabezado de sub-sesión */}
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
                            {formatSessionDate(group.authEvent.timestamp)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Eventos del grupo */}
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
                          {/* Punto directamente centrado en la línea */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-23px', // Centro exacto: 24px (inicio línea) + 1px (mitad de 2px de ancho)
                              top: '2px',
                              width: `${pointSize}px`,
                              height: `${pointSize}px`,
                              marginLeft: `-${pointSize / 2}px`, // Centrar el punto
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

                          {/* Hora y nombre del evento */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              paddingTop: '0.1em',
                              marginLeft: '-0.5 rem',
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
                ))}
              </div>
            )}
          </div>

          {/* Mitad derecha: Detalles del evento */}
          <div
            style={{
              overflowY: 'auto',
              padding: '2rem',
              background: 'var(--card)',
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

                {/* Información del evento */}
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

                {/* Properties */}
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
                            }}
                          >
                            {key}
                          </div>
                          <div
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 500,
                              color: 'var(--foreground)',
                            }}
                          >
                            {String(value)}
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

function SessionCard({ session, formatDate, formatDuration, onClick }: {
  session: MockSession
  formatDate: (date: Date) => string
  formatDuration: (seconds: number) => string
  onClick: () => void
}) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        background: 'var(--background)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {session.appUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  marginBottom: '0.125rem',
                }}
              >
                {session.appUsername}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted-foreground)',
                }}
              >
                {formatDate(session.startTime)}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--muted-foreground)',
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
                style={{ opacity: 0.7 }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatDuration(session.duration)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--muted-foreground)',
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
                style={{ opacity: 0.7 }}
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>{session.eventCount} eventos</span>
            </div>
          </div>
        </div>
        <div>
          <span
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: session.isActive ? 'rgba(34, 197, 94, 0.1)' : 'var(--muted)',
              color: session.isActive ? '#22c55e' : 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {session.isActive ? 'Activa' : 'Finalizada'}
          </span>
        </div>
      </div>
    </div>
  )
}

