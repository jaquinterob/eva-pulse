import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import { getUniqueUsers, getTotalSessions, getTotalEvents, getSessionsByDateRange, getSessionsByUser } from '@/lib/services/trackingService'

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
    const appUsername = searchParams.get('appUsername')

    if (startDate && endDate) {
      // Si hay filtros de fecha, calcular stats para ese rango
      const sessions = await getSessionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
      
      // Si se especifica appUsername, filtrar por él
      const filteredSessions = appUsername 
        ? sessions.filter(s => s.appUsername === appUsername)
        : sessions
      
      const uniqueUsersSet = new Set(filteredSessions.map(s => s.appUsername))

      return NextResponse.json({
        success: true,
        data: {
          uniqueUsers: uniqueUsersSet.size,
          totalSessions: filteredSessions.length,
          totalEvents: filteredSessions.reduce((sum, s) => sum + s.eventCount, 0),
        },
      })
    }

    // Sin filtros de fecha
    if (appUsername) {
      // Stats de un usuario específico
      const userSessions = await getSessionsByUser(appUsername)
      const Event = (await import('@/lib/models/Event')).default
      const { connectDB } = await import('@/lib/db/connection')
      await connectDB()
      
      const totalEvents = await Event.countDocuments({ appUsername })

      return NextResponse.json({
        success: true,
        data: {
          uniqueUsers: 1,
          totalSessions: userSessions.length,
          totalEvents,
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

