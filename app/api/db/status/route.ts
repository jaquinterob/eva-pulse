import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connection'
import mongoose from 'mongoose'

export async function GET() {
  try {
    // Intentar conectar si no está conectado
    await connectDB()

    // Hacer un ping real a la base de datos para verificar la conexión
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('No se pudo obtener la instancia de la base de datos')
    }

    // Hacer ping a la base de datos - si esto funciona, la conexión está correcta
    await db.admin().ping()
    
    return NextResponse.json({
      status: 'connected',
      connected: true,
      message: 'Base de datos conectada exitosamente',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: error instanceof Error ? error.message : 'Error desconocido al conectar a la base de datos',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

