import { connectDB } from '../lib/db/connection'
import { createUser } from '../lib/services/authService'

/**
 * Semilla inicial de usuarios de aplicación (colección users).
 * Prioridad de contraseña para eva-admin: APP_ADMIN_PASSWORD en .env
 */
async function seedUsers() {
  const adminPassword =
    process.env.APP_ADMIN_PASSWORD || 'eva-pulse-admin-cambiar'

  const seeds: { username: string; password: string }[] = [
    { username: 'dev', password: 'dev' },
    { username: 'eva-admin', password: adminPassword },
  ]

  try {
    await connectDB()

    for (const { username, password } of seeds) {
      const created = await createUser(username, password)
      if (created) {
        console.log(`✅ Usuario creado: ${username}`)
      } else {
        console.log(`ℹ️  Sin cambios (ya existe): ${username}`)
      }
    }

    if (!process.env.APP_ADMIN_PASSWORD) {
      console.log(
        '\n⚠️  Define APP_ADMIN_PASSWORD en .env y vuelve a ejecutar npm run seed-users para usar otra contraseña en nuevas instalaciones.'
      )
    }
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedUsers()
