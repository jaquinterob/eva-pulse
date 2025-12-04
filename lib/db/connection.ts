import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn(
    'Warning: MONGODB_URI is not defined. Please define it in .env file'
  )
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

/**
 * Establishes a single connection to MongoDB.
 * Reuses existing connection in development to prevent multiple connections.
 * 
 * @returns Promise that resolves to the mongoose connection
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    )
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Gets the current MongoDB connection.
 * 
 * @returns The mongoose connection if established, null otherwise
 */
export function getConnection(): typeof mongoose | null {
  return cached.conn
}

/**
 * Checks if MongoDB is connected.
 * 
 * @returns True if connected, false otherwise
 */
export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1
}

