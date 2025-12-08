import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import {
  getSessionsByDateRange,
  getSessionsByUser,
  getUniqueUsers,
  getTotalSessions,
  getActiveSessions,
} from '@/lib/services/trackingService'

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
      const sessions = await getSessionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      )

      // Si se especifica appUsername, filtrar por él
      if (appUsername) {
        const filtered = sessions.filter((s) => s.appUsername === appUsername)
        return NextResponse.json({ success: true, data: filtered })
      }

      return NextResponse.json({ success: true, data: sessions })
    }

    if (appUsername) {
      // Buscar sesiones por appUsername
      const sessions = await getSessionsByUser(appUsername)
      return NextResponse.json({ success: true, data: sessions })
    }

    // Si no hay filtros, devolver todas las sesiones
    const allSessions = await getSessionsByDateRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      new Date()
    )

    return NextResponse.json({ success: true, data: allSessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

