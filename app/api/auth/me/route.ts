import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware/auth'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  const user = verifyAuth(request)

  if (!user) {
    return unauthorizedResponse()
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      id: user.userId,
      username: user.username,
    },
  })
}

