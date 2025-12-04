import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Eva Pulse API está funcionando correctamente',
    timestamp: new Date().toISOString(),
  })
}

