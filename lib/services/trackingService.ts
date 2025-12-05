import { connectDB } from '@/lib/db/connection'
import Session, { type ISession } from '@/lib/models/Session'
import Event, { type IEvent } from '@/lib/models/Event'

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

