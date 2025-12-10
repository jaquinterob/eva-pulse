import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import { getEventsByDateRange } from '@/lib/services/trackingService'

interface InferencePair {
  startTime: Date
  responseTime: Date
  duration: number // en milisegundos
  sessionId: string
}

export async function GET(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    // Obtener todos los eventos (o filtrar por rango de fechas si se proporciona)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const appUsername = searchParams.get('appUsername')

    let allEvents
    if (startDate && endDate) {
      allEvents = await getEventsByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
    } else {
      // Obtener eventos de los últimos 30 días por defecto
      const endDateDefault = new Date()
      const startDateDefault = new Date()
      startDateDefault.setDate(startDateDefault.getDate() - 30)
      allEvents = await getEventsByDateRange(startDateDefault, endDateDefault)
    }

    // Filtrar por appUsername si se proporciona
    if (appUsername) {
      allEvents = allEvents.filter(e => e.appUsername === appUsername)
    }

    // Filtrar eventos de inferencia
    const inferenceStarts = allEvents.filter(
      (e) =>
        e.eventName?.toLowerCase().includes('inference') &&
        (e.eventName?.toLowerCase().includes('start') ||
          e.eventName?.toLowerCase().includes('inicio'))
    )

    const inferenceResponses = allEvents.filter(
      (e) =>
        e.eventName?.toLowerCase().includes('inference') &&
        (e.eventName?.toLowerCase().includes('response') ||
          e.eventName?.toLowerCase().includes('respuesta') ||
          e.eventName?.toLowerCase().includes('end') ||
          e.eventName?.toLowerCase().includes('fin'))
    )

    // Emparejar eventos de start y response por sessionId y orden temporal
    const pairs: InferencePair[] = []
    const processedStarts = new Set<string>()

    for (const start of inferenceStarts) {
      if (processedStarts.has(start.eventId)) continue

      // Buscar el response correspondiente (mismo sessionId, después del start)
      const matchingResponse = inferenceResponses
        .filter(
          (r) =>
            r.sessionId === start.sessionId &&
            new Date(r.timestamp) > new Date(start.timestamp) &&
            !processedStarts.has(r.eventId)
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]

      if (matchingResponse) {
        const duration =
          new Date(matchingResponse.timestamp).getTime() -
          new Date(start.timestamp).getTime()

        if (duration > 0) {
          pairs.push({
            startTime: new Date(start.timestamp),
            responseTime: new Date(matchingResponse.timestamp),
            duration,
            sessionId: start.sessionId,
          })
          processedStarts.add(start.eventId)
        }
      }
    }

    if (pairs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          average: 0,
          max: 0,
          min: 0,
          total: 0,
          pairs: [],
        },
      })
    }

    // Calcular estadísticas
    const durations = pairs.map((p) => p.duration)
    const average = durations.reduce((a, b) => a + b, 0) / durations.length
    const max = Math.max(...durations)
    const min = Math.min(...durations)

    // Encontrar el par con mayor y menor duración
    const maxPair = pairs.find((p) => p.duration === max)
    const minPair = pairs.find((p) => p.duration === min)

    return NextResponse.json({
      success: true,
      data: {
        average: Math.round(average), // en milisegundos
        max: max,
        min: min,
        total: pairs.length,
        maxPair: maxPair
          ? {
              duration: maxPair.duration,
              startTime: maxPair.startTime.toISOString(),
              responseTime: maxPair.responseTime.toISOString(),
              sessionId: maxPair.sessionId,
            }
          : null,
        minPair: minPair
          ? {
              duration: minPair.duration,
              startTime: minPair.startTime.toISOString(),
              responseTime: minPair.responseTime.toISOString(),
              sessionId: minPair.sessionId,
            }
          : null,
        // Incluir todos los pares para la gráfica
        allPairs: pairs.map(p => ({
          duration: p.duration,
          startTime: p.startTime.toISOString(),
          responseTime: p.responseTime.toISOString(),
          sessionId: p.sessionId,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching inference stats:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener estadísticas de inferencia',
      },
      { status: 500 }
    )
  }
}

