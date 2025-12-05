export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Solo ejecutar en el servidor Node.js (no en Edge Runtime)
    const { connectDB } = await import('./lib/db/connection')
    const { createUser } = await import('./lib/services/authService')
    
    // Conectar a la base de datos al iniciar el servidor
    try {
      await connectDB()
      
      // Crear usuario dev si no existe
      if (process.env.NODE_ENV === 'development') {
        const devUser = await createUser('dev', 'dev')
        if (devUser) {
          console.log('✅ Usuario "dev" inicializado')
        }
      }
    } catch (error) {
      // El error ya se mostrará en los listeners de mongoose
      console.error('Error al inicializar la conexión a la base de datos')
    }
  }
}

