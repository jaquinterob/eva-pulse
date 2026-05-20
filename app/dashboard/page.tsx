'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import EvaPulseIcon from '@/components/ui/EvaPulseIcon'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { normalizePlate, formatPlateDisplay } from '@/lib/utils/plate'

// Tipos compatibles con los datos de la API
interface InferenceData {
  duration: number // Tiempo de inferencia en milisegundos
  placa?: string // Placa de la evaluación
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
  inferences?: InferenceData[] // Array de datos de inferencias individuales
  hasError?: boolean
  errorCount?: number
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
  metadata?: {
    error?: string
    success?: boolean
  }
}

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

  // Estado para filtro de release date
  const [selectedReleaseDate, setSelectedReleaseDate] = useState<string | null>(null)

  // Estado para búsqueda por placa
  const [plateSearchQuery, setPlateSearchQuery] = useState('')

  // Vista activa del menú principal
  const [dashboardView, setDashboardView] = useState<'sessions' | 'errors'>('sessions')

  // Estado para errores
  const [totalErrors, setTotalErrors] = useState(0)
  const [errorEvents, setErrorEvents] = useState<TrackingEvent[]>([])
  const [errorCountBySession, setErrorCountBySession] = useState<Record<string, number>>({})
  const [loadingErrors, setLoadingErrors] = useState(false)

  // Estado para el modal de timeline
  const [selectedSessionForTimeline, setSelectedSessionForTimeline] = useState<TrackingSession | null>(null)

  // Estado para datos
  const [allSessions, setAllSessions] = useState<TrackingSession[]>([])
  const [allUsers, setAllUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [timeAgo, setTimeAgo] = useState<string>('')

  // Estado para estadísticas de inferencia
  const [inferenceStats, setInferenceStats] = useState<{
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
  } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Estado para paginación e infinite scroll
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loadedItems, setLoadedItems] = useState(10) // Para infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false)

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

  // Función para calcular tiempo transcurrido
  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 10) {
      return 'ahora mismo'
    } else if (diffSecs < 60) {
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

  // Actualizar tiempo transcurrido cada segundo
  useEffect(() => {
    if (!lastUpdate) return

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastUpdate))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastUpdate])

  // Función para cargar estadísticas de inferencia
  const loadInferenceStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        setLoadingStats(false)
        return
      }

      // Construir URL con parámetros de filtro
      const statsUrl = new URL('/api/tracking/inference-stats', window.location.origin)
      statsUrl.searchParams.set('startDate', startDateObj.toISOString())
      statsUrl.searchParams.set('endDate', endDateObj.toISOString())
      if (selectedUser) {
        statsUrl.searchParams.set('appUsername', selectedUser)
      }

      const response = await fetch(statsUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        // Si hay filtro de releaseDate, filtrar los pares por las sesiones que coinciden
        let filteredPairs = data.data.allPairs || []
        
        if (selectedReleaseDate && filteredPairs.length > 0) {
          // Obtener sessionIds de las sesiones que coinciden con el releaseDate
          const filteredSessionIds = new Set(
            allSessions
              .filter(s => {
                const sessionDate = new Date(s.startTime)
                const dateMatch = sessionDate >= startDateObj && sessionDate <= endDateObj
                const userMatch = !selectedUser || s.appUsername === selectedUser
                const releaseDateMatch = s.deviceInfo?.releaseDate === selectedReleaseDate
                return dateMatch && userMatch && releaseDateMatch
              })
              .map(s => s.sessionId)
          )
          
          // Filtrar los pares por sessionId
          filteredPairs = filteredPairs.filter((p: any) => 
            filteredSessionIds.has(p.sessionId)
          )
          
          // Recalcular estadísticas con los pares filtrados
          if (filteredPairs.length > 0) {
            const durations = filteredPairs.map((p: any) => p.duration)
            const average = durations.reduce((a: number, b: number) => a + b, 0) / durations.length
            const max = Math.max(...durations)
            const min = Math.min(...durations)
            
            const maxPair = filteredPairs.find((p: any) => p.duration === max)
            const minPair = filteredPairs.find((p: any) => p.duration === min)
            
            setInferenceStats({
              average: Math.round(average),
              max: max,
              min: min,
              total: filteredPairs.length,
              maxPair: maxPair ? {
                duration: maxPair.duration,
                startTime: maxPair.startTime,
                responseTime: maxPair.responseTime,
                sessionId: maxPair.sessionId,
              } : null,
              minPair: minPair ? {
                duration: minPair.duration,
                startTime: minPair.startTime,
                responseTime: minPair.responseTime,
                sessionId: minPair.sessionId,
              } : null,
            })
          } else {
            setInferenceStats({
              average: 0,
              max: 0,
              min: 0,
              total: 0,
              maxPair: null,
              minPair: null,
            })
          }
        } else {
          setInferenceStats({
            average: data.data.average,
            max: data.data.max,
            min: data.data.min,
            total: data.data.total,
            maxPair: data.data.maxPair,
            minPair: data.data.minPair,
          })
        }
      }
    } catch (error) {
      console.error('Error loading inference stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }, [startDateObj, endDateObj, selectedUser, selectedReleaseDate, allSessions])

  // Función para cargar datos de la API
  const loadData = async () => {
      setLoading(true)
      try {
        // Obtener token del localStorage
        const authData = localStorage.getItem('eva-pulse-auth')
        const token = authData ? JSON.parse(authData).token : null

        if (!token) {
          console.error('No hay token de autenticación')
          setLoading(false)
          return
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }

        // Cargar sesiones
        const sessionsUrl = new URL('/api/tracking/sessions', window.location.origin)
        sessionsUrl.searchParams.set('startDate', startDateObj.toISOString())
        sessionsUrl.searchParams.set('endDate', endDateObj.toISOString())
        if (selectedUser) {
          sessionsUrl.searchParams.set('appUsername', selectedUser)
        }

        const sessionsResponse = await fetch(sessionsUrl.toString(), { headers })
        const sessionsData = await sessionsResponse.json()
        if (sessionsData.success) {
          // Calcular tiempo de inferencia promedio para cada sesión
          const sessionsWithInference = await Promise.all(
            sessionsData.data.map(async (s: any) => {
              // Obtener eventos de inferencia para esta sesión
              const eventsUrl = new URL('/api/tracking/events', window.location.origin)
              eventsUrl.searchParams.set('sessionId', s.sessionId)
              
              try {
                const eventsResponse = await fetch(eventsUrl.toString(), { headers })
                const eventsData = await eventsResponse.json()
                
                if (eventsData.success && eventsData.data) {
                  const events = eventsData.data
                  
                  // Filtrar eventos de inferencia
                  const inferenceStarts = events.filter(
                    (e: any) =>
                      e.eventName?.toLowerCase().includes('inference') &&
                      (e.eventName?.toLowerCase().includes('start') ||
                        e.eventName?.toLowerCase().includes('inicio'))
                  )
                  
                  const inferenceResponses = events.filter(
                    (e: any) =>
                      e.eventName?.toLowerCase().includes('inference') &&
                      (e.eventName?.toLowerCase().includes('response') ||
                        e.eventName?.toLowerCase().includes('respuesta') ||
                        e.eventName?.toLowerCase().includes('end') ||
                        e.eventName?.toLowerCase().includes('fin'))
                  )
                  
                  // Calcular duraciones de inferencia individuales con placas
                  const inferenceData: InferenceData[] = []
                  const processedStarts = new Set<string>()
                  
                  for (const start of inferenceStarts) {
                    if (processedStarts.has(start.eventId)) continue
                    
                    const matchingResponse = inferenceResponses
                      .filter(
                        (r: any) =>
                          r.sessionId === start.sessionId &&
                          new Date(r.timestamp) > new Date(start.timestamp) &&
                          !processedStarts.has(r.eventId)
                      )
                      .sort((a: any, b: any) => 
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                      )[0]
                    
                    if (matchingResponse) {
                      const duration =
                        new Date(matchingResponse.timestamp).getTime() -
                        new Date(start.timestamp).getTime()
                      
                      if (duration > 0) {
                        // Extraer placa de las propiedades del evento de inicio o respuesta
                        const placa = 
                          start.properties?.placa || 
                          start.properties?.plate || 
                          start.properties?.licensePlate ||
                          matchingResponse.properties?.placa ||
                          matchingResponse.properties?.plate ||
                          matchingResponse.properties?.licensePlate ||
                          undefined
                        
                        inferenceData.push({
                          duration,
                          placa: placa ? String(placa) : undefined,
                        })
                        processedStarts.add(start.eventId)
                      }
                    }
                  }
                  
                  return {
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime),
                    inferences: inferenceData.length > 0 ? inferenceData : undefined,
                  }
                }
              } catch (error) {
                console.error(`Error calculating inference time for session ${s.sessionId}:`, error)
              }
              
              return {
                ...s,
                startTime: new Date(s.startTime),
                endTime: new Date(s.endTime),
                inferences: undefined,
              }
            })
          )
          
          setAllSessions(sessionsWithInference)
        }

        // Cargar usuarios únicos
        const statsUrl = new URL('/api/tracking/stats', window.location.origin)
        statsUrl.searchParams.set('startDate', startDateObj.toISOString())
        statsUrl.searchParams.set('endDate', endDateObj.toISOString())
        
        const usersResponse = await fetch(statsUrl.toString(), { headers })
        const usersData = await usersResponse.json()
        if (usersData.success) {
          // Obtener usuarios únicos de las sesiones
          const uniqueUsersSet = new Set<string>()
          sessionsData.data.forEach((s: any) => uniqueUsersSet.add(s.appUsername))
          setAllUsers(Array.from(uniqueUsersSet))
        }

      // Actualizar timestamp de última actualización
      setLastUpdate(new Date())
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

  const loadErrors = useCallback(async () => {
    setLoadingErrors(true)
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        setLoadingErrors(false)
        return
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const statsUrl = new URL('/api/tracking/stats', window.location.origin)
      statsUrl.searchParams.set('startDate', startDateObj.toISOString())
      statsUrl.searchParams.set('endDate', endDateObj.toISOString())
      if (selectedUser) {
        statsUrl.searchParams.set('appUsername', selectedUser)
      }

      const eventsUrl = new URL('/api/tracking/events', window.location.origin)
      eventsUrl.searchParams.set('eventType', 'error')
      eventsUrl.searchParams.set('startDate', startDateObj.toISOString())
      eventsUrl.searchParams.set('endDate', endDateObj.toISOString())
      if (selectedUser) {
        eventsUrl.searchParams.set('appUsername', selectedUser)
      }

      const [statsResponse, eventsResponse] = await Promise.all([
        fetch(statsUrl.toString(), { headers }),
        fetch(eventsUrl.toString(), { headers }),
      ])

      const statsData = await statsResponse.json()
      if (statsData.success && typeof statsData.data.totalErrors === 'number') {
        setTotalErrors(statsData.data.totalErrors)
      } else {
        setTotalErrors(0)
      }

      const eventsData = await eventsResponse.json()
      if (eventsData.success) {
        const errors: TrackingEvent[] = eventsData.data.map((e: TrackingEvent) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }))
        setErrorEvents(errors)

        const countMap: Record<string, number> = {}
        errors.forEach((e) => {
          countMap[e.sessionId] = (countMap[e.sessionId] || 0) + 1
        })
        setErrorCountBySession(countMap)
      } else {
        setErrorEvents([])
        setErrorCountBySession({})
      }
    } catch (error) {
      console.error('Error loading errors:', error)
      setTotalErrors(0)
      setErrorEvents([])
      setErrorCountBySession({})
    } finally {
      setLoadingErrors(false)
    }
  }, [startDateObj, endDateObj, selectedUser])

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadData()
    loadErrors()
  }, [startDateObj, endDateObj, selectedUser, loadErrors])

  // Cargar estadísticas de inferencia cuando cambian los filtros
  useEffect(() => {
    loadInferenceStats()
  }, [loadInferenceStats])

  // Obtener release dates únicos de las sesiones
  const availableReleaseDates = useMemo(() => {
    const releaseDatesSet = new Set<string>()
    allSessions.forEach((s: TrackingSession) => {
      if (s.deviceInfo?.releaseDate) {
        releaseDatesSet.add(s.deviceInfo.releaseDate)
      }
    })
    return Array.from(releaseDatesSet).sort().reverse() // Ordenar descendente (más reciente primero)
  }, [allSessions])

  const sessionsWithErrorFlags = useMemo(() => {
    return allSessions.map((s) => {
      const count = errorCountBySession[s.sessionId] || 0
      return {
        ...s,
        hasError: count > 0,
        errorCount: count > 0 ? count : undefined,
      }
    })
  }, [allSessions, errorCountBySession])

  const plateSearchNormalized = useMemo(
    () => (plateSearchQuery.length >= 2 ? normalizePlate(plateSearchQuery) : ''),
    [plateSearchQuery]
  )

  // Filtrar sesiones según el rango de fechas, usuario, release date y placa
  const filteredSessions = useMemo(() => {
    return sessionsWithErrorFlags.filter((s) => {
      const sessionDate = new Date(s.startTime)
      const dateMatch = sessionDate >= startDateObj && sessionDate <= endDateObj

      const releaseDateMatch =
        !selectedReleaseDate || s.deviceInfo?.releaseDate === selectedReleaseDate

      const plateMatch =
        !plateSearchNormalized ||
        (s.inferences?.some((inf) =>
          inf.placa ? normalizePlate(inf.placa).includes(plateSearchNormalized) : false
        ) ?? false)

      return dateMatch && releaseDateMatch && plateMatch
    })
  }, [
    sessionsWithErrorFlags,
    startDateObj,
    endDateObj,
    selectedReleaseDate,
    plateSearchNormalized,
  ])

  const filteredSessionIds = useMemo(
    () => new Set(filteredSessions.map((s) => s.sessionId)),
    [filteredSessions]
  )

  const errorsForView = useMemo(() => {
    let errors = errorEvents
    if (selectedReleaseDate || plateSearchNormalized) {
      errors = errors.filter((e) => filteredSessionIds.has(e.sessionId))
    }
    return errors
  }, [errorEvents, selectedReleaseDate, plateSearchNormalized, filteredSessionIds])

  const goToErrorsView = useCallback(() => {
    setDashboardView('errors')
    loadErrors()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [loadErrors])

  const sessionById = useMemo(() => {
    const map = new Map<string, TrackingSession>()
    sessionsWithErrorFlags.forEach((s) => map.set(s.sessionId, s))
    return map
  }, [sessionsWithErrorFlags])

  const errorsGroupedBySession = useMemo(() => {
    const bySession = new Map<string, TrackingEvent[]>()
    errorsForView.forEach((err) => {
      const list = bySession.get(err.sessionId) ?? []
      list.push(err)
      bySession.set(err.sessionId, list)
    })

    const groups = Array.from(bySession.entries()).map(([sessionId, errors]) => {
      const sorted = [...errors].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      const session = sessionById.get(sessionId)
      return {
        sessionId,
        appUsername: session?.appUsername ?? sorted[0].appUsername,
        errorCount: sorted.length,
        errors: sorted,
        latestErrorAt: new Date(sorted[0].timestamp),
        session,
      }
    })

    return groups.sort(
      (a, b) => b.latestErrorAt.getTime() - a.latestErrorAt.getTime()
    )
  }, [errorsForView, sessionById])

  const totalErrorsInView = useMemo(
    () => errorsGroupedBySession.reduce((sum, g) => sum + g.errorCount, 0),
    [errorsGroupedBySession]
  )

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

  // Limpiar filtro de release date
  const clearReleaseDateFilter = () => {
    setSelectedReleaseDate(null)
  }

  const clearPlateFilter = () => {
    setPlateSearchQuery('')
  }

  // Valores por defecto de fechas
  const defaultStartDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    date.setHours(0, 0, 0, 0)
    return date.toISOString().slice(0, 16)
  }, [])

  const defaultEndDate = useMemo(() => {
    const date = new Date()
    date.setHours(23, 59, 59, 999)
    return date.toISOString().slice(0, 16)
  }, [])

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      selectedUser !== null ||
      selectedReleaseDate !== null ||
      plateSearchQuery.length >= 2 ||
      startDate !== defaultStartDate ||
      endDate !== defaultEndDate
    )
  }, [
    selectedUser,
    selectedReleaseDate,
    plateSearchQuery,
    startDate,
    endDate,
    defaultStartDate,
    defaultEndDate,
  ])

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedUser(null)
    setSearchQuery('')
    setShowAutocomplete(false)
    setSelectedReleaseDate(null)
    setPlateSearchQuery('')
    setStartDate(defaultStartDate)
    setEndDate(defaultEndDate)
  }

  // Función para cargar sesión desde sessionId para el modal
  const loadSessionForModal = async (sessionId: string) => {
    try {
      const authData = localStorage.getItem('eva-pulse-auth')
      const token = authData ? JSON.parse(authData).token : null

      if (!token) {
        console.error('No hay token de autenticación')
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

        setSelectedSessionForTimeline(tempSession)
      }
    } catch (err) {
      console.error('Error loading session:', err)
    }
  }

  // Calcular métricas
  const totalSessions = filteredSessions.length
  const uniqueUsers = useMemo(() => {
    return new Set(filteredSessions.map(s => s.appUsername)).size
  }, [filteredSessions])

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Calcular cuántas cards caben por pantalla (aproximadamente)
      if (window.innerWidth >= 768) {
        // Desktop: calcular basado en altura de card (~150px) y altura de viewport
        const cardHeight = 150
        const viewportHeight = window.innerHeight - 400 // Restar espacio de header y filtros
        const cardsPerView = Math.max(3, Math.floor(viewportHeight / cardHeight))
        setItemsPerPage(cardsPerView)
      } else {
        // Mobile: calcular basado en altura de card y viewport
        const cardHeight = 180
        const viewportHeight = window.innerHeight - 300
        const cardsPerView = Math.max(2, Math.floor(viewportHeight / cardHeight))
        setItemsPerPage(cardsPerView)
        setLoadedItems(cardsPerView)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Resetear paginación cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
    setLoadedItems(itemsPerPage)
  }, [filteredSessions, itemsPerPage])

  // Sesiones ordenadas
  const sortedSessions = useMemo(() => {
    return [...filteredSessions]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [filteredSessions])

  // Sesiones a mostrar según dispositivo
  const latestSessions = useMemo(() => {
    if (isMobile) {
      // Infinite scroll: mostrar hasta loadedItems
      return sortedSessions.slice(0, loadedItems)
    } else {
      // Paginación: mostrar según página actual
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return sortedSessions.slice(startIndex, endIndex)
    }
  }, [sortedSessions, isMobile, currentPage, itemsPerPage, loadedItems])

  // Calcular total de páginas (solo para desktop)
  const totalPages = useMemo(() => {
    if (isMobile) return 0
    return Math.ceil(sortedSessions.length / itemsPerPage)
  }, [sortedSessions.length, itemsPerPage, isMobile])

  // Función para cargar más items (infinite scroll)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !isMobile) return
    if (loadedItems >= sortedSessions.length) return

    setIsLoadingMore(true)
    // Simular carga con un pequeño delay
    setTimeout(() => {
      setLoadedItems(prev => Math.min(prev + itemsPerPage, sortedSessions.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isMobile, isLoadingMore, loadedItems, sortedSessions.length, itemsPerPage])

  // Observer para infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && loadedItems < sortedSessions.length) {
        loadMore()
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [isLoadingMore, loadedItems, sortedSessions.length, loadMore])

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
      <style dangerouslySetInnerHTML={{__html: `
        .datetime-input::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none;
        }
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
        {/* Header estilo Amplitude */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 auto', minWidth: 0 }}>
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
            <nav
              style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
                fontSize: '0.875rem',
              }}
              aria-label="Secciones del dashboard"
            >
              <button
                type="button"
                onClick={() => setDashboardView('sessions')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  background:
                    dashboardView === 'sessions' ? 'var(--muted)' : 'transparent',
                  fontWeight: dashboardView === 'sessions' ? 600 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Sesiones
              </button>
              <button
                type="button"
                onClick={() => setDashboardView('errors')}
                className={
                  dashboardView === 'errors' ? 'error-nav-btn error-nav-btn--active' : 'error-nav-btn'
                }
              >
                Errores
                {totalErrors > 0 && (
                  <span className="error-count-pill">
                    {loadingErrors ? '…' : totalErrors}
                  </span>
                )}
              </button>
            </nav>
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
              <>
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
                <Link
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: 'var(--foreground)',
                    background: 'transparent',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--muted)'
                    e.currentTarget.style.borderColor = 'var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <span>Guía</span>
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </>
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
            padding: '1rem',
            maxWidth: '1600px',
            margin: '0 auto',
          }}
        >

          {/* Filtros y métricas en la misma línea */}
          <div
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            {/* Buscador de usuario */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 100%',
                minWidth: '200px',
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
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Escribe al menos 2 letras para buscar..."
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: selectedUser ? '2.5rem' : '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '16px', /* Prevenir zoom en iOS */
                    outline: 'none',
                    transition: 'all 0.2s',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    minHeight: '44px',
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
                            return allSessions.filter((s: TrackingSession) => s.appUsername === username).length
                          })()} sesiones
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buscador de placa */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 100%',
                minWidth: '200px',
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
                Buscar Placa
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={plateSearchQuery}
                  onChange={(e) => setPlateSearchQuery(e.target.value)}
                  placeholder="Ej. ABC o ABC123"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: plateSearchQuery.length >= 2 ? '2.5rem' : '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    minHeight: '44px',
                  }}
                />
                {plateSearchQuery.length >= 2 && (
                  <button
                    onClick={clearPlateFilter}
                    type="button"
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
                    }}
                    title="Limpiar filtro de placa"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Selector de fechas */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flex: '1 1 auto', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px', minWidth: '150px' }}>
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
                      padding: '0.75rem 0.875rem',
                      paddingRight: '2.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontSize: '16px', /* Prevenir zoom en iOS */
                      width: '100%',
                      minHeight: '44px',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                    }}
                    className="datetime-input"
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
              <div style={{ flex: '1 1 150px', minWidth: '150px' }}>
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
                      padding: '0.75rem 0.875rem',
                      paddingRight: '2.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontSize: '16px', /* Prevenir zoom en iOS */
                      width: '100%',
                      minHeight: '44px',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                    }}
                    className="datetime-input"
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

            {/* Selector de Release Date */}
            <div style={{ flex: '1 1 150px', minWidth: '150px' }}>
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
                Release Date
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedReleaseDate || ''}
                  onChange={(e) => setSelectedReleaseDate(e.target.value || null)}
                  style={{
                    padding: '0.75rem 0.875rem',
                    paddingRight: selectedReleaseDate ? '2.5rem' : '0.875rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '16px', /* Prevenir zoom en iOS */
                    width: '100%',
                    minHeight: '44px',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                  }}
                >
                  <option value="">Todos los releases</option>
                  {availableReleaseDates.map((releaseDate) => (
                    <option key={releaseDate} value={releaseDate}>
                      {releaseDate}
                    </option>
                  ))}
                </select>
                {selectedReleaseDate && (
                  <button
                    onClick={clearReleaseDateFilter}
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
                    title="Limpiar filtro de release date"
                  >
                    ×
                  </button>
                )}
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
                    right: selectedReleaseDate ? '2.5rem' : '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    opacity: 0.6,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
          </div>

          </div>

          {/* Badges de filtros activos y botón limpiar */}
            <div
              style={{
                marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {(selectedUser || selectedReleaseDate || plateSearchQuery.length >= 2) && (
              <>
                {selectedUser && (
                  <div
                    style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
              }}
            >
                    <span>Usuario: <strong>{selectedUser}</strong></span>
            </div>
          )}
                {plateSearchQuery.length >= 2 && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>
                      Placa: <strong>{formatPlateDisplay(plateSearchQuery)}</strong>
                    </span>
                  </div>
                )}
                {selectedReleaseDate && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>Release: <strong>{selectedReleaseDate}</strong></span>
                  </div>
                )}
              </>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted-foreground)'
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Limpiar todos los filtros
              </button>
            )}
          </div>

          {dashboardView === 'errors' ? (
            <div className="error-panel">
              <div
                className="error-panel__header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                      margin: '0 0 0.25rem 0',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Errores del período
                  </h2>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted-foreground)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {errorsGroupedBySession.length}{' '}
                    {errorsGroupedBySession.length === 1 ? 'sesión' : 'sesiones'} con{' '}
                    {totalErrorsInView}{' '}
                    {totalErrorsInView === 1 ? 'error' : 'errores'} · clic para ver timeline
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="error-btn-ghost"
                    onClick={() => {
                      loadData()
                      loadErrors()
                    }}
                    disabled={loadingErrors}
                  >
                    {loadingErrors ? 'Actualizando…' : 'Actualizar'}
                  </button>
                  <CompactMetricCard
                    title="Total"
                    value={totalErrors}
                    color="var(--error)"
                  />
                </div>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                {loadingErrors ? (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                      margin: 0,
                    }}
                  >
                    Cargando errores...
                  </p>
                ) : errorsGroupedBySession.length === 0 ? (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                      margin: 0,
                    }}
                  >
                    No hay errores registrados con los filtros seleccionados.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {errorsGroupedBySession.map((group) => (
                      <SessionErrorGroupCard
                        key={group.sessionId}
                        group={group}
                        formatDate={formatDate}
                        formatDuration={formatDuration}
                        onClick={() => loadSessionForModal(group.sessionId)}
                      />
                    ))}
                  </div>
                )}
                {!loadingErrors &&
                  totalErrorsInView > 0 &&
                  totalErrors > totalErrorsInView && (
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--muted-foreground)',
                        margin: '0.75rem 0 0',
                      }}
                    >
                      Mostrando {totalErrorsInView} de {totalErrors} errores en{' '}
                      {errorsGroupedBySession.length}{' '}
                      {errorsGroupedBySession.length === 1 ? 'sesión' : 'sesiones'} (máx. 100
                      eventos en listado)
                    </p>
                  )}
              </div>
            </div>
          ) : (
          /* Últimas sesiones en formato de cards */
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
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
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
                    {!loadingErrors && totalErrors > 0 && (
                      <span style={{ marginLeft: '0.75rem', color: 'var(--error-text)' }}>
                        · {totalErrors} {totalErrors === 1 ? 'error' : 'errores'}
                      </span>
                    )}
                    {lastUpdate && (
                      <span style={{ marginLeft: '0.75rem' }}>
                        • Actualizado {timeAgo}
                      </span>
                    )}
                </p>
              </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    loadData()
                    loadErrors()
                  }}
                  disabled={loading || loadingErrors}
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
                  title="Actualizar lista de sesiones"
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
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
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
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                      Actualizar
                    </>
                  )}
                </button>
                <CompactMetricCard
                  title="Sesiones"
                  value={totalSessions}
                  color="var(--primary)"
                />
                <CompactMetricCard
                  title="Usuarios"
                  value={uniqueUsers}
                  color="var(--primary)"
                />
                <CompactMetricCard
                  title="Errores"
                  value={loadingErrors ? 0 : totalErrors}
                  color="var(--error)"
                  clickable
                  onClick={goToErrorsView}
                  loading={loadingErrors}
                  titleAttr={
                    totalErrors > 0
                      ? 'Ver errores del rango de fechas'
                      : 'Sin errores en el rango'
                  }
                />
                {inferenceStats && (
                  <>
                    <CompactTimeStatCard
                      title="Inf. Promedio"
                      value={inferenceStats.average}
                      description={`${inferenceStats.total} eval`}
                      color="var(--primary)"
                      loading={loadingStats}
                    />
                    {inferenceStats.minPair && (
                      <CompactTimeStatCard
                        title="Inf. Mínimo"
                        value={inferenceStats.min}
                        description="más rápido"
                        color="#22c55e"
                        loading={loadingStats}
                        onClick={() => loadSessionForModal(inferenceStats.minPair!.sessionId)}
                        clickable
                      />
                    )}
                    {inferenceStats.maxPair && (
                      <CompactTimeStatCard
                        title="Inf. Máximo"
                        value={inferenceStats.max}
                        description="más lento"
                        color="#ef4444"
                        loading={loadingStats}
                        onClick={() => loadSessionForModal(inferenceStats.maxPair!.sessionId)}
                        clickable
                        isNegative
                      />
                    )}
                  </>
                )}
                </div>
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
              
              {/* Controles de paginación (Desktop) */}
              {!isMobile && totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1.5rem 1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="pagination-nav-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                    }}
                  >
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          type="button"
                          key={pageNum}
                          className={
                            currentPage === pageNum
                              ? 'pagination-page-btn pagination-page-btn--active'
                              : 'pagination-page-btn'
                          }
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    type="button"
                    className="pagination-nav-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>

                  <div className="pagination-meta">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>
              )}
              
              {/* Infinite scroll trigger (Mobile) */}
              {isMobile && loadedItems < sortedSessions.length && (
                <div
                  ref={loadMoreRef}
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  {isLoadingMore ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'var(--muted-foreground)',
                      }}
                    >
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
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                      Cargando más...
                    </div>
                  ) : (
                    <div
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Mostrando {loadedItems} de {sortedSessions.length} sesiones
                    </div>
                  )}
                </div>
              )}
              
              {/* Indicador de fin (Mobile) */}
              {isMobile && loadedItems >= sortedSessions.length && sortedSessions.length > 0 && (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.875rem',
                  }}
                >
                  Has visto todas las sesiones ({sortedSessions.length})
                </div>
              )}
            </div>
          </div>
          )}
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

function MinimalStatCard({ 
  title, 
  value, 
  description, 
  color, 
  loading, 
  onClick,
  clickable 
}: {
  title: string
  value: number
  description?: string
  color: string
  loading?: boolean
  onClick?: () => void
  clickable?: boolean
}) {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(1)
      return `${minutes}m ${seconds}s`
    }
  }

  return (
    <div
      onClick={clickable && onClick ? onClick : undefined}
      style={{
        padding: '0.875rem 1rem',
        background: 'var(--card)',
        borderRadius: '8px',
        border: `1px solid ${clickable ? color : 'var(--border)'}`,
        boxShadow: clickable 
          ? `0 1px 3px ${color}15, 0 1px 2px rgba(0,0,0,0.05)`
          : '0 1px 2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        minHeight: '75px',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 4px 12px ${color}25, 0 2px 4px rgba(0,0,0,0.08)`
          e.currentTarget.style.borderColor = color
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = `0 1px 3px ${color}15, 0 1px 2px rgba(0,0,0,0.05)`
        }
      }}
    >
      {/* Indicador de clickeable */}
      {clickable && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            opacity: 0.4,
          }}
        />
      )}
      
      <div
        style={{
          fontSize: '0.6875rem',
          color: 'var(--muted-foreground)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      
      <div
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: color,
          lineHeight: 1.2,
          marginBottom: description ? '0.125rem' : '0',
        }}
      >
        {loading ? '...' : formatDuration(value)}
      </div>
      
      {description && (
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--muted-foreground)',
            lineHeight: 1.3,
            opacity: 0.8,
          }}
        >
          {description}
        </div>
      )}
      
      {clickable && (
        <div
          style={{
            fontSize: '0.625rem',
            color: color,
            fontWeight: 500,
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: 0.7,
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
          </svg>
          Ver sesión
        </div>
      )}
    </div>
  )
}

function CompactMetricCard({
  title,
  value,
  color,
  clickable,
  onClick,
  loading,
  titleAttr,
}: {
  title: string
  value: number
  color: string
  clickable?: boolean
  onClick?: () => void
  loading?: boolean
  titleAttr?: string
}) {
  const isErrorMetric = color === 'var(--error)'

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={titleAttr}
      onClick={clickable && onClick ? onClick : undefined}
      onKeyDown={
        clickable && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      style={{
        padding: '0.5rem 0.75rem',
        background: 'var(--card)',
        borderRadius: '6px',
        border: `1px solid ${isErrorMetric ? 'var(--error-border)' : 'var(--border)'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        minWidth: '70px',
        maxWidth: '100px',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        opacity: loading ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (!clickable) return
        e.currentTarget.style.borderColor = isErrorMetric ? 'var(--error)' : 'var(--primary)'
        e.currentTarget.style.boxShadow = isErrorMetric
          ? '0 2px 8px var(--error-subtle)'
          : '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        if (!clickable) return
        e.currentTarget.style.borderColor = isErrorMetric ? 'var(--error-border)' : 'var(--border)'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--muted-foreground)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: color,
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {loading ? '…' : value.toLocaleString()}
      </div>
    </div>
  )
}

function CompactTimeStatCard({ 
  title, 
  value, 
  description, 
  color, 
  loading, 
  onClick,
  clickable,
  isNegative
}: {
  title: string
  value: number
  description?: string
  color: string
  loading?: boolean
  onClick?: () => void
  clickable?: boolean
  isNegative?: boolean
}) {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(1)
      return `${minutes}m ${seconds}s`
    }
  }

  const isDestructive =
    color === 'var(--destructive)' || color === 'var(--error)' || isNegative
  
  return (
    <div
      onClick={clickable && onClick ? onClick : undefined}
      style={{
        padding: '0.5rem 0.75rem',
        background: 'var(--card)',
        borderRadius: '6px',
        border: `2px solid ${color}`,
        boxShadow: clickable 
          ? `0 1px 3px ${color}15, 0 1px 2px rgba(0,0,0,0.05)`
          : `0 1px 2px ${color}10`,
        minWidth: '70px',
        maxWidth: '100px',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = `0 2px 8px ${color}25, 0 1px 3px rgba(0,0,0,0.08)`
          e.currentTarget.style.borderColor = color
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = `0 1px 2px ${color}10`
        }
      }}
    >
      {/* Indicador de clickeable */}
      {clickable && (
        <div
          style={{
            position: 'absolute',
            top: '0.375rem',
            right: '0.375rem',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: color,
            opacity: 0.4,
          }}
        />
      )}
      
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--muted-foreground)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--foreground)',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {loading ? '...' : formatDuration(value)}
      </div>
      
      {description && (
        <div
          style={{
            fontSize: '0.5625rem',
            color: 'var(--muted-foreground)',
            lineHeight: 1.2,
            opacity: 0.8,
            textAlign: 'center',
          }}
        >
          {description}
        </div>
      )}
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
      // Obtener token del localStorage
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
        
        // Seleccionar el último evento (más reciente) y marcar para hacer scroll
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

  // Función para calcular tiempo transcurrido
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

  // Actualizar tiempo transcurrido cada segundo
  useEffect(() => {
    if (!lastUpdate) return

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastUpdate))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastUpdate])

  // Cargar eventos de la sesión al montar el componente
  useEffect(() => {
    loadEvents()
  }, [session.sessionId])

  // Hacer scroll al final solo cuando se recarga (no cuando se selecciona manualmente)
  useEffect(() => {
    if (!loadingEvents && timelineContainerRef.current && selectedEventId && sessionEvents.length > 0 && shouldScrollToEndRef.current) {
      // Esperar a que el DOM se actualice completamente
      setTimeout(() => {
        if (timelineContainerRef.current) {
          // Hacer scroll al final del contenedor
          timelineContainerRef.current.scrollTo({
            top: timelineContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
          // Resetear el flag después de hacer scroll
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

  // Función para verificar si un evento de autenticación es un login
  const isLoginEventCheck = (event: TrackingEvent | null): boolean => {
    if (!event || event.eventType !== 'authentication') return false
    const eventName = event.eventName.toLowerCase()
    return eventName.includes('login') || eventName === 'authenticated' || eventName === 'signin'
  }

  // Agrupar eventos por sub-sesiones basadas en eventos de autenticación
  const groupedEvents = useMemo(() => {
    const groups: Array<{ authEvent: TrackingEvent | null; events: TrackingEvent[] }> = []
    let currentGroup: { authEvent: TrackingEvent | null; events: TrackingEvent[] } | null = null

    // Función para determinar si un evento de autenticación es un login
    const isLoginEvent = (event: TrackingEvent): boolean => {
      if (event.eventType !== 'authentication') return false
      const eventName = event.eventName.toLowerCase()
      return eventName.includes('login') || eventName === 'authenticated' || eventName === 'signin'
    }

    sortedEvents.forEach((event) => {
      if (event.eventType === 'authentication' && isLoginEvent(event)) {
        // Si ya hay un grupo, guardarlo
        if (currentGroup) {
          groups.push(currentGroup)
        }
        // Crear nuevo grupo con este evento de login
        currentGroup = {
          authEvent: event,
          events: [event]
        }
      } else {
        // Cualquier otro evento (incluyendo logout): agregar al grupo actual
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
      error: 'var(--error)'
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

  // Función para copiar al portapapeles
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
        {/* Header del Modal */}
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

        {/* Contenido dividido en 60-40 (responsive) */}
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
          {/* Timeline (arriba en móvil, izquierda en desktop) */}
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
              <div className="timeline-rail">
                {groupedEvents.map((group, groupIndex) => {
                  const showNewSessionHeader =
                    group.authEvent && isLoginEventCheck(group.authEvent)

                  return (
                    <div key={groupIndex}>
                      {showNewSessionHeader && (
                        <div
                          className={groupIndex > 0 ? 'timeline-session-divider' : undefined}
                          style={{
                            marginBottom: '1rem',
                            paddingLeft: 'calc(var(--timeline-rail-width) + 0.75rem)',
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
                      )}

                      {group.events.map((event) => {
                        const isSelected = selectedEventId === event.eventId
                        const isHovered = hoveredEventId === event.eventId
                        const isActive = isSelected || isHovered
                        const eventColor = getEventTypeColor(event.eventType)

                        return (
                          <div
                            key={event.eventId}
                            className="timeline-row"
                            onClick={() => setSelectedEventId(event.eventId)}
                            onMouseEnter={() => setHoveredEventId(event.eventId)}
                            onMouseLeave={() => setHoveredEventId(null)}
                          >
                            <div
                              className={
                                isActive ? 'timeline-node timeline-node--active' : 'timeline-node'
                              }
                              style={{
                                background: eventColor,
                                boxShadow: isActive
                                  ? `0 0 0 4px color-mix(in srgb, ${eventColor} 25%, transparent), 0 0 0 8px color-mix(in srgb, ${eventColor} 12%, transparent)`
                                  : `0 0 0 2px color-mix(in srgb, ${eventColor} 30%, transparent)`,
                              }}
                            />
                            <div className="timeline-row-content">
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  fontSize: '0.75rem',
                                  color: isSelected ? eventColor : 'var(--muted-foreground)',
                                  fontWeight: isSelected ? 600 : 500,
                                  minWidth: '85px',
                                  transition: 'color 0.2s ease',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: isSelected ? 1 : 0.8,
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
                                  color: isSelected
                                    ? 'var(--foreground)'
                                    : 'var(--muted-foreground)',
                                  transition: 'color 0.2s ease',
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

          {/* Detalles del evento (abajo en móvil, derecha en desktop) */}
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

function formatInferenceTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(1)
  return `${minutes}m ${seconds}s`
}

function extractPlacaFromProperties(
  properties?: Record<string, unknown>
): string | undefined {
  if (!properties) return undefined
  const raw =
    properties.placa ?? properties.plate ?? properties.licensePlate
  return raw != null ? String(raw) : undefined
}

function getUniquePlacas(
  session?: TrackingSession,
  ...propertySources: (Record<string, unknown> | undefined)[]
): string[] {
  const seen = new Set<string>()
  const add = (raw?: string) => {
    if (!raw) return
    const n = normalizePlate(raw)
    if (n) seen.add(n)
  }
  propertySources.forEach((props) => add(extractPlacaFromProperties(props)))
  session?.inferences?.forEach((inf) => add(inf.placa))
  return Array.from(seen)
}

function getPlatformInfo(platform: string) {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes('android')) {
    return {
      name: 'Android',
      icon: (
        <img
          src="https://img.icons8.com/fluency/48/android-os.png"
          alt="Android"
          width="16"
          height="16"
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            filter: 'grayscale(100%) brightness(0.3)',
            opacity: 1,
          }}
        />
      ),
    }
  }
  if (
    platformLower.includes('ios') ||
    platformLower.includes('iphone') ||
    platformLower.includes('ipad')
  ) {
    return {
      name: 'iOS',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      ),
    }
  }
  return {
    name: platform || 'Unknown',
    icon: (
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
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  }
}

function SessionErrorGroupCard({
  group,
  formatDate,
  formatDuration,
  onClick,
}: {
  group: {
    sessionId: string
    appUsername: string
    errorCount: number
    errors: TrackingEvent[]
    latestErrorAt: Date
    session?: TrackingSession
  }
  formatDate: (date: Date) => string
  formatDuration: (seconds: number) => string
  onClick: () => void
}) {
  const { session, errors, errorCount, appUsername } = group
  const platformInfo = getPlatformInfo(session?.deviceInfo?.platform || '')
  const placas = getUniquePlacas(
    session,
    ...errors.map((e) => e.properties)
  )
  const latestError = errors[0]
  const lastMessage =
    latestError.metadata?.error ||
    latestError.properties?.errorCode ||
    latestError.properties?.message ||
    null
  const errorTypes = [
    ...new Set(errors.map((e) => e.eventName.replace(/_/g, ' '))),
  ].slice(0, 3)

  return (
    <div
      role="button"
      tabIndex={0}
      className="error-card"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid var(--error-border)',
                background: 'var(--error-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--error-text)',
                fontWeight: 600,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              {appUsername.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.125rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {appUsername}
                </span>
                <span
                  className="error-badge"
                  style={{
                    background: 'var(--error)',
                    color: 'var(--error-foreground)',
                    borderColor: 'var(--error)',
                  }}
                >
                  {errorCount} {errorCount === 1 ? 'error' : 'errores'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {session ? (
                  <>
                    <span>Sesión: {formatDate(session.startTime)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {platformInfo.icon}
                      <span>{platformInfo.name}</span>
                    </span>
                  </>
                ) : (
                  <span>Sesión: {group.sessionId.slice(0, 12)}…</span>
                )}
                <span>· Último: {formatDate(group.latestErrorAt)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: lastMessage || errorTypes.length > 0 ? '0.5rem' : 0,
            }}
          >
            {session && session.duration > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
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
            )}
            {session?.deviceInfo?.releaseDate && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.625rem',
                  background: 'var(--muted)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, opacity: 0.8 }}>
                  Release:
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {session.deviceInfo.releaseDate}
                </span>
              </div>
            )}
            {errorTypes.length > 0 && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted-foreground)',
                }}
              >
                {errorTypes.join(' · ')}
                {errors.length > errorTypes.length
                  ? ` · +${errors.length - errorTypes.length} más`
                  : ''}
              </div>
            )}
          </div>

          {lastMessage && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--error-text)',
                lineHeight: 1.45,
                paddingLeft: '0.5rem',
                borderLeft: '2px solid var(--error-border)',
              }}
            >
              {String(lastMessage)}
            </div>
          )}
        </div>

        {placas.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}
          >
            {placas.map((placa) => (
              <span key={placa} className="plate-chip plate-chip--classic">
                {formatPlateDisplay(placa)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session, formatDate, formatDuration, onClick }: {
  session: TrackingSession
  formatDate: (date: Date) => string
  formatDuration: (seconds: number) => string
  onClick: () => void
}) {
  const platformInfo = getPlatformInfo(session.deviceInfo?.platform || '')
  const hasError = session.hasError === true

  return (
    <div
      className={hasError ? 'error-session-card' : undefined}
      style={{
        padding: '1rem 1.25rem',
        background: 'var(--background)',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hasError ? 'var(--error-border)' : 'var(--primary)'
        e.currentTarget.style.boxShadow = hasError
          ? '0 4px 12px var(--error-subtle)'
          : '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
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
              {hasError && (
                <span className="error-session-flag" style={{ marginTop: '0.25rem' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--error)',
                      flexShrink: 0,
                    }}
                  />
                  {(session.errorCount ?? 0) > 1
                    ? `${session.errorCount} errores`
                    : 'Error'}
                </span>
              )}
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>{formatDate(session.startTime)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {platformInfo.icon}
                  <span>{platformInfo.name}</span>
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '0.75rem',
            }}
          >
            {session.duration > 0 && (
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
            )}
            {session.deviceInfo?.releaseDate && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.625rem',
                  background: 'var(--muted)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.6 }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, opacity: 0.8 }}>Release:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{session.deviceInfo.releaseDate}</span>
              </div>
            )}
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
        {session.inferences && session.inferences.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {session.inferences.map((inference, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.7rem',
                  background: 'var(--card)',
                  borderRadius: '6px',
                  color: 'var(--foreground)',
                  border: '1.5px solid var(--primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontWeight: 500,
                  minWidth: 'fit-content',
                  alignItems: 'center',
                }}
                title={`Inferencia ${index + 1}: ${formatInferenceTime(inference.duration)}${inference.placa ? ` - Placa: ${inference.placa}` : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ fontWeight: 600, letterSpacing: '0.2px' }}>
                    {formatInferenceTime(inference.duration)}
                  </span>
                </div>
                {inference.placa && (() => {
                  const placaFormateada = formatPlateDisplay(String(inference.placa))

                  return (
                    <span className="plate-chip plate-chip--classic">{placaFormateada}</span>
                  )
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

