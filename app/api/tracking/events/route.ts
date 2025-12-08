import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import {
  getEventsBySession,
  getEventsByUser,
  getEventsByDateRange,
  getEventsByType,
  createEvent,
} from '@/lib/services/trackingService'

export async function GET(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const appUsername = searchParams.get('appUsername')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const eventType = searchParams.get('eventType')

    if (sessionId) {
      const events = await getEventsBySession(sessionId)
      // Si se especifica appUsername, filtrar por él
      if (appUsername) {
        const filtered = events.filter((e) => e.appUsername === appUsername)
        return NextResponse.json({ success: true, data: filtered })
      }
      return NextResponse.json({ success: true, data: events })
    }

    if (appUsername) {
      const events = await getEventsByUser(appUsername)
      return NextResponse.json({ success: true, data: events })
    }

    if (startDate && endDate) {
      const events = await getEventsByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
      // Si se especifica appUsername, filtrar por él
      if (appUsername) {
        const filtered = events.filter((e) => e.appUsername === appUsername)
        return NextResponse.json({ success: true, data: filtered })
      }
      return NextResponse.json({ success: true, data: events })
    }

    if (eventType) {
      const events = await getEventsByType(eventType)
      // Si se especifica appUsername, filtrar por él
      if (appUsername) {
        const filtered = events.filter((e) => e.appUsername === appUsername)
        return NextResponse.json({ success: true, data: filtered })
      }
      return NextResponse.json({ success: true, data: events })
    }

    return NextResponse.json(
      { success: false, error: 'Parámetros insuficientes' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()

    if (!body.sessionId || !body.appUsername || !body.eventType || !body.eventName) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId, appUsername, eventType y eventName son requeridos',
        },
        { status: 400 }
      )
    }

    // Validar eventType
    const validEventTypes = ['authentication', 'interaction', 'event', 'navigation', 'error']
    if (!validEventTypes.includes(body.eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `eventType debe ser uno de: ${validEventTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Usar el username enviado desde el cliente
    const appUsername = body.appUsername.trim()

    const event = await createEvent({
      sessionId: body.sessionId,
      appUsername: appUsername,
      eventType: body.eventType,
      eventName: body.eventName,
      context: body.context,
      properties: body.properties,
      metadata: body.metadata,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        eventId: event.eventId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        message: 'Evento registrado correctamente',
      },
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear evento',
      },
      { status: 500 }
    )
  }
}

