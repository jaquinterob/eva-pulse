import { connectDB } from '@/lib/db/connection'
import Session, { type ISession } from '@/lib/models/Session'
import Event, { type IEvent } from '@/lib/models/Event'
import User from '@/lib/models/User'

// Tipos compatibles con los mocks
export interface TrackingSession {
  sessionId: string
  appUsername: string
  startTime: Date
  endTime: Date
  duration: number
  eventCount: number
  deviceInfo: {
    platform: string
    language: string
  }
  isActive: boolean
}

export interface TrackingEvent {
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

// Convertir objeto plano de sesión a TrackingSession
function convertSession(session: any): TrackingSession {
  return {
    sessionId: session.sessionId,
    appUsername: session.appUsername,
    startTime: new Date(session.startTime),
    endTime: session.endTime ? new Date(session.endTime) : new Date(),
    duration: session.duration,
    eventCount: session.eventCount,
    deviceInfo: {
      platform: session.deviceInfo?.platform || 'Unknown',
      language: session.deviceInfo?.language || 'es-ES',
    },
    isActive: session.isActive,
  }
}

// Convertir objeto plano de evento a TrackingEvent
function convertEvent(event: any): TrackingEvent {
  return {
    eventId: event.eventId,
    sessionId: event.sessionId,
    appUsername: event.appUsername,
    eventType: event.eventType,
    eventName: event.eventName,
    timestamp: new Date(event.timestamp),
    context: {
      page: event.context?.page,
      component: event.context?.component,
      elementType: event.context?.elementType,
      route: event.context?.route,
      url: event.context?.url,
      elementId: event.context?.elementId,
    },
    properties: event.properties || {},
  }
}

export async function getSessionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<TrackingSession[]> {
  await connectDB()
  const sessions = await Session.find({
    startTime: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ startTime: -1 })
    .lean()

  return sessions.map(convertSession)
}

export async function getSessionsByUser(
  appUsername: string
): Promise<TrackingSession[]> {
  await connectDB()
  const sessions = await Session.find({ appUsername })
    .sort({ startTime: -1 })
    .lean()

  return sessions.map(convertSession)
}

export async function getEventsBySession(
  sessionId: string
): Promise<TrackingEvent[]> {
  await connectDB()
  const events = await Event.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean()

  return events.map(convertEvent)
}

export async function getEventsByUser(
  appUsername: string
): Promise<TrackingEvent[]> {
  await connectDB()
  const events = await Event.find({ appUsername })
    .sort({ timestamp: -1 })
    .lean()

  return events.map(convertEvent)
}

export async function getUniqueUsers(): Promise<string[]> {
  await connectDB()
  // Obtener los appUsername distintos de las sesiones
  const users = await Session.distinct('appUsername')
  return users
}

export async function getTotalSessions(): Promise<number> {
  await connectDB()
  return await Session.countDocuments()
}

export async function getTotalEvents(): Promise<number> {
  await connectDB()
  return await Event.countDocuments()
}

export async function getActiveSessions(): Promise<TrackingSession[]> {
  await connectDB()
  const sessions = await Session.find({ isActive: true })
    .sort({ startTime: -1 })
    .lean()

  return sessions.map(convertSession)
}

export async function getEventsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<TrackingEvent[]> {
  await connectDB()
  const events = await Event.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ timestamp: -1 })
    .lean()

  return events.map(convertEvent)
}

export async function getEventsByType(
  eventType: string
): Promise<TrackingEvent[]> {
  await connectDB()
  const events = await Event.find({ eventType })
    .sort({ timestamp: -1 })
    .lean()

  return events.map(convertEvent)
}

// Crear nueva sesión
export async function createSession(data: {
  sessionId: string
  appUsername: string
  deviceInfo: {
    userAgent?: string
    platform: string
    screenWidth?: number
    screenHeight?: number
    language: string
    releaseDate?: string
  }
  location?: {
    timezone?: string
    country?: string
  }
}): Promise<ISession> {
  await connectDB()
  
  const session = new Session({
    sessionId: data.sessionId,
    appUsername: data.appUsername,
    startTime: new Date(),
    duration: 0,
    eventCount: 0,
    deviceInfo: data.deviceInfo,
    location: data.location,
    isActive: true,
  })

  await session.save()
  return session
}

// Finalizar sesión
export async function endSession(
  sessionId: string,
  appUsername: string
): Promise<ISession | null> {
  await connectDB()
  
  const session = await Session.findOne({ sessionId, appUsername })
  if (!session) {
    return null
  }

  const endTime = new Date()
  const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)
  
  session.endTime = endTime
  session.duration = duration
  session.isActive = false
  
  await session.save()
  return session
}

// Crear evento
export async function createEvent(data: {
  sessionId: string
  appUsername: string
  eventType: 'authentication' | 'interaction' | 'event' | 'navigation' | 'error'
  eventName: string
  context?: {
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
  timestamp?: Date
}): Promise<IEvent> {
  await connectDB()
  
  // Verificar que la sesión existe
  const session = await Session.findOne({ sessionId: data.sessionId })
  if (!session) {
    throw new Error('Sesión no encontrada')
  }

  // Generar eventId único
  const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const event = new Event({
    eventId,
    sessionId: data.sessionId,
    appUsername: data.appUsername,
    eventType: data.eventType,
    eventName: data.eventName,
    timestamp: data.timestamp || new Date(),
    context: data.context || {},
    properties: data.properties || {},
    metadata: data.metadata,
  })

  await event.save()

  // Actualizar contador de eventos en la sesión
  session.eventCount = (session.eventCount || 0) + 1
  await session.save()

  return event
}

