import { NextResponse } from 'next/server'
import { connectDB, isConnected } from '@/lib/db/connection'
import mongoose from 'mongoose'

export async function GET() {
  try {
    // Intentar conectar si no está conectado
    await connectDB()
    
    const connected = isConnected()
    
    if (!connected) {
      return NextResponse.json({
        status: 'disconnected',
        connected: false,
        message: 'No se pudo conectar a la base de datos',
        timestamp: new Date().toISOString(),
      })
    }

    // Hacer un ping real a la base de datos para verificar la conexión
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('No se pudo obtener la instancia de la base de datos')
    }

    // Hacer ping a la base de datos
    await db.admin().ping()
    
    // Listar las colecciones disponibles
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)
    
    return NextResponse.json({
      status: 'connected',
      connected: true,
      message: 'Base de datos conectada exitosamente',
      collections: collectionNames,
      collectionsCount: collectionNames.length,
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

