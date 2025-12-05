import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/services/authService'
import type { ApiResponse } from '@/types'

interface LoginRequest {
  username: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    if (!body.username || !body.password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Usuario y contraseña son requeridos',
        },
        { status: 400 }
      )
    }

    if (typeof body.username !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Usuario y contraseña deben ser texto',
        },
        { status: 400 }
      )
    }

    if (body.username.trim().length === 0 || body.password.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Usuario y contraseña no pueden estar vacíos',
        },
        { status: 400 }
      )
    }

    const result = await login({
      username: body.username.trim(),
      password: body.password,
    })

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error || 'Error al iniciar sesión',
        },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Error al procesar la solicitud',
      },
      { status: 500 }
    )
  }
}

