import mongoose, { Schema, Document } from 'mongoose'

export interface IEvent extends Document {
  eventId: string
  sessionId: string
  appUsername: string
  eventType: 'authentication' | 'interaction' | 'event' | 'navigation' | 'error'
  eventName: string
  timestamp: Date
  context: {
    page?: string
    component?: string
    elementId?: string
    elementType?: string
    url?: string
    route?: string
  }
  properties?: Record<string, any>
  metadata?: {
    duration?: number
    value?: string | number
    previousValue?: any
    error?: string
    success?: boolean
  }
  createdAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    appUsername: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['authentication', 'interaction', 'event', 'navigation', 'error'],
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    context: {
      page: String,
      component: String,
      elementId: String,
      elementType: String,
      url: String,
      route: String,
    },
    properties: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      duration: Number,
      value: Schema.Types.Mixed,
      previousValue: Schema.Types.Mixed,
      error: String,
      success: Boolean,
    },
  },
  {
    timestamps: true,
  }
)

// Índices compuestos para consultas eficientes
EventSchema.index({ sessionId: 1, timestamp: -1 })
EventSchema.index({ appUsername: 1, timestamp: -1 })
EventSchema.index({ eventType: 1, timestamp: -1 })
EventSchema.index({ 'context.page': 1 })

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)

export default Event

