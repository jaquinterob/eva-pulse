import { NextRequest, NextResponse } from 'next/server'
import {
  getEventsBySession,
  getEventsByUser,
  getEventsByDateRange,
  getEventsByType,
} from '@/lib/services/trackingService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const appUsername = searchParams.get('appUsername')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const eventType = searchParams.get('eventType')

    if (sessionId) {
      const events = await getEventsBySession(sessionId)
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
      return NextResponse.json({ success: true, data: events })
    }

    if (eventType) {
      const events = await getEventsByType(eventType)
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

