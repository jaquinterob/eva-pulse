import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import { endSession } from '@/lib/services/trackingService'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()

    if (!body.sessionId || !body.appUsername) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId y appUsername son requeridos',
        },
        { status: 400 }
      )
    }

    const session = await endSession(body.sessionId, body.appUsername)

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesión no encontrada',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        endTime: session.endTime,
        duration: session.duration,
        eventCount: session.eventCount,
        message: 'Sesión finalizada correctamente',
      },
    })
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al finalizar sesión',
      },
      { status: 500 }
    )
  }
}

