import { connectDB } from '../lib/db/connection'
import { createUser } from '../lib/services/authService'

async function initDevUser() {
  try {
    await connectDB()

    const user = await createUser('dev', 'dev')

    if (user) {
      console.log('✅ Usuario "dev" creado exitosamente')
      console.log('   Usuario: dev')
      console.log('   Contraseña: dev')
    } else {
      console.log('ℹ️  El usuario "dev" ya existe')
    }
  } catch (error) {
    console.error('❌ Error al crear usuario dev:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

initDevUser()

