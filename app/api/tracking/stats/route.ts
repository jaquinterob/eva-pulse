import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import { getUniqueUsers, getTotalSessions, getTotalEvents, getSessionsByDateRange } from '@/lib/services/trackingService'

export async function GET(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (startDate && endDate) {
      // Si hay filtros de fecha, calcular stats para ese rango
      const sessions = await getSessionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
      const uniqueUsersSet = new Set(sessions.map(s => s.appUsername))

      return NextResponse.json({
        success: true,
        data: {
          uniqueUsers: uniqueUsersSet.size,
          totalSessions: sessions.length,
          totalEvents: sessions.reduce((sum, s) => sum + s.eventCount, 0),
        },
      })
    }

    // Sin filtros, devolver stats globales
    const [uniqueUsers, totalSessions, totalEvents] = await Promise.all([
      getUniqueUsers(),
      getTotalSessions(),
      getTotalEvents(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        uniqueUsers: uniqueUsers.length,
        totalSessions,
        totalEvents,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

