import mongoose, { Schema, Document } from 'mongoose'

export interface ISession extends Document {
  sessionId: string
  appUsername: string
  startTime: Date
  endTime?: Date
  duration: number
  eventCount: number
  deviceInfo: {
    userAgent?: string
    platform: string
    screenWidth?: number
    screenHeight?: number
    language: string
    releaseDate?: string
  }
  location?: {
    timezone?: string
    country?: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    appUsername: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    eventCount: {
      type: Number,
      required: true,
      default: 0,
    },
    deviceInfo: {
      userAgent: String,
      platform: {
        type: String,
        required: true,
      },
      screenWidth: Number,
      screenHeight: Number,
      language: {
        type: String,
        required: true,
      },
      releaseDate: String,
    },
    location: {
      timezone: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Índices compuestos para consultas eficientes
SessionSchema.index({ appUsername: 1, startTime: -1 })
SessionSchema.index({ isActive: 1, startTime: -1 })

const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

export default Session

