import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User, { type IUser } from '@/lib/models/User'
import { connectDB } from '@/lib/db/connection'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  token?: string
  user?: {
    id: string
    username: string
  }
  error?: string
}

/**
 * Authenticates a user with username and password.
 * 
 * @param credentials - Username and password
 * @returns Authentication result with JWT token if successful
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    await connectDB()

    const user = await User.findOne({ username: credentials.username.toLowerCase() })

    if (!user) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al iniciar sesión',
    }
  }
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
    return decoded
  } catch {
    return null
  }
}

/**
 * Creates a new user with hashed password.
 * 
 * @param username - Username for the new user
 * @param password - Plain text password (will be hashed)
 * @returns Created user or null if error
 */
export async function createUser(username: string, password: string): Promise<IUser | null> {
  try {
    await connectDB()

    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      return null
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
    })

    await user.save()
    return user
  } catch {
    return null
  }
}


