import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/services/authService'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    username: string
  }
}

/**
 * Middleware to verify JWT token in request headers.
 * 
 * @param request - Next.js request object
 * @returns NextResponse with error if unauthorized, or null if authorized
 */
export function verifyAuth(request: NextRequest): { userId: string; username: string } | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  return decoded
}

/**
 * Creates an unauthorized response.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'No autorizado',
    },
    { status: 401 }
  )
}

