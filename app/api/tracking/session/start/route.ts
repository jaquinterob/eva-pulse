import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import { createSession } from '@/lib/services/trackingService'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const user = verifyAuth(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()

    if (!body.sessionId || !body.appUsername || !body.deviceInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId, appUsername y deviceInfo son requeridos',
        },
        { status: 400 }
      )
    }

    if (!body.deviceInfo.platform || !body.deviceInfo.language) {
      return NextResponse.json(
        {
          success: false,
          error: 'deviceInfo.platform y deviceInfo.language son requeridos',
        },
        { status: 400 }
      )
    }

    // Usar el username enviado desde el cliente
    const appUsername = body.appUsername.trim()

    // Verificar que no exista una sesión activa con el mismo sessionId
    const { getSessionsByUser } = await import('@/lib/services/trackingService')
    const { connectDB } = await import('@/lib/db/connection')
    const Session = (await import('@/lib/models/Session')).default
    
    await connectDB()
    const existingSession = await Session.findOne({ 
      sessionId: body.sessionId,
      isActive: true 
    })

    if (existingSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe una sesión activa con este sessionId',
        },
        { status: 400 }
      )
    }

    const session = await createSession({
      sessionId: body.sessionId,
      appUsername: appUsername,
      deviceInfo: {
        userAgent: body.deviceInfo.userAgent,
        platform: body.deviceInfo.platform,
        screenWidth: body.deviceInfo.screenWidth,
        screenHeight: body.deviceInfo.screenHeight,
        language: body.deviceInfo.language,
      },
      location: body.location,
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        startTime: session.startTime,
        message: 'Sesión iniciada correctamente',
      },
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear sesión',
      },
      { status: 500 }
    )
  }
}

