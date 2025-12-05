export interface MockSession {
  sessionId: string
  appUsername: string
  startTime: Date
  endTime: Date
  duration: number
  eventCount: number
  deviceInfo: {
    platform: string
    language: string
  }
  isActive: boolean
}

export interface MockEvent {
  eventId: string
  sessionId: string
  appUsername: string
  eventType: string
  eventName: string
  timestamp: Date
  context: {
    page?: string
    component?: string
    elementType?: string
  }
  properties?: Record<string, any>
}

const generateDate = (daysAgo: number, hours: number = 0, minutes: number = 0): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date
}

const generateDateRange = (startDate: Date, minutes: number): Date => {
  return new Date(startDate.getTime() + minutes * 60000)
}

export const mockSessions: MockSession[] = [
  {
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    startTime: generateDate(2, 10, 0),
    endTime: generateDate(2, 10, 45),
    duration: 2700,
    eventCount: 32,
    deviceInfo: {
      platform: 'Web',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-002',
    appUsername: 'juan_perez',
    startTime: generateDate(1, 14, 30),
    endTime: generateDate(1, 15, 20),
    duration: 3000,
    eventCount: 45,
    deviceInfo: {
      platform: 'Web',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-003',
    appUsername: 'maria_garcia',
    startTime: generateDate(3, 9, 15),
    endTime: generateDate(3, 9, 50),
    duration: 2100,
    eventCount: 28,
    deviceInfo: {
      platform: 'iOS',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-004',
    appUsername: 'maria_garcia',
    startTime: generateDate(1, 16, 0),
    endTime: generateDate(1, 16, 35),
    duration: 2100,
    eventCount: 38,
    deviceInfo: {
      platform: 'iOS',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-005',
    appUsername: 'carlos_rodriguez',
    startTime: generateDate(0, 8, 0),
    endTime: generateDate(0, 8, 25),
    duration: 1500,
    eventCount: 22,
    deviceInfo: {
      platform: 'Android',
      language: 'es-MX'
    },
    isActive: false
  },
  {
    sessionId: 'session-006',
    appUsername: 'carlos_rodriguez',
    startTime: generateDate(0, 11, 0),
    endTime: new Date(),
    duration: Math.floor((Date.now() - generateDate(0, 11, 0).getTime()) / 1000),
    eventCount: 15,
    deviceInfo: {
      platform: 'Android',
      language: 'es-MX'
    },
    isActive: true
  },
  {
    sessionId: 'session-007',
    appUsername: 'ana_martinez',
    startTime: generateDate(4, 13, 0),
    endTime: generateDate(4, 13, 40),
    duration: 2400,
    eventCount: 35,
    deviceInfo: {
      platform: 'Web',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-008',
    appUsername: 'dev',
    startTime: generateDate(0, 9, 0),
    endTime: generateDate(0, 9, 30),
    duration: 1800,
    eventCount: 42,
    deviceInfo: {
      platform: 'Web',
      language: 'es-ES'
    },
    isActive: false
  },
  {
    sessionId: 'session-009',
    appUsername: 'dev',
    startTime: generateDate(0, 12, 0),
    endTime: new Date(),
    duration: Math.floor((Date.now() - generateDate(0, 12, 0).getTime()) / 1000),
    eventCount: 28,
    deviceInfo: {
      platform: 'Web',
      language: 'es-ES'
    },
    isActive: true
  },
  {
    sessionId: 'session-010',
    appUsername: 'luis_fernandez',
    startTime: generateDate(5, 10, 0),
    endTime: generateDate(5, 10, 55),
    duration: 3300,
    eventCount: 52,
    deviceInfo: {
      platform: 'Web',
      language: 'es-AR'
    },
    isActive: false
  }
]

export const mockEvents: MockEvent[] = [
  {
    eventId: 'event-001',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(2, 10, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-002',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(2, 10, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-003',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'interaction',
    eventName: 'button_click',
    timestamp: generateDate(2, 10, 5),
    context: { page: 'dashboard', component: 'SearchButton', elementType: 'button' },
    properties: { buttonText: 'Buscar' }
  },
  {
    eventId: 'event-004',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'interaction',
    eventName: 'input_focus',
    timestamp: generateDate(2, 10, 8),
    context: { page: 'dashboard', component: 'SearchInput' },
    properties: { searchType: 'users' }
  },
  {
    eventId: 'event-005',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(2, 10, 12),
    context: { page: 'evaluation', route: '/evaluation/123' }
  },
  {
    eventId: 'event-006',
    sessionId: 'session-001',
    appUsername: 'juan_perez',
    eventType: 'event',
    eventName: 'answer_submitted',
    timestamp: generateDate(2, 10, 18),
    context: { page: 'evaluation', component: 'QuestionForm' },
    properties: { evaluationId: 'eval-123', questionId: 'q-1' }
  },
  {
    eventId: 'event-007',
    sessionId: 'session-002',
    appUsername: 'juan_perez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(1, 14, 30),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-008',
    sessionId: 'session-002',
    appUsername: 'juan_perez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(1, 14, 32),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-009',
    sessionId: 'session-002',
    appUsername: 'juan_perez',
    eventType: 'interaction',
    eventName: 'button_click',
    timestamp: generateDate(1, 14, 35),
    context: { page: 'dashboard', component: 'LogoutButton', elementType: 'button' }
  },
  {
    eventId: 'event-010',
    sessionId: 'session-002',
    appUsername: 'juan_perez',
    eventType: 'authentication',
    eventName: 'logout',
    timestamp: generateDate(1, 14, 36),
    context: { page: 'dashboard', component: 'LogoutButton' }
  },
  {
    eventId: 'event-011',
    sessionId: 'session-003',
    appUsername: 'maria_garcia',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(3, 9, 15),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-012',
    sessionId: 'session-003',
    appUsername: 'maria_garcia',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(3, 9, 17),
    context: { page: 'evaluations', route: '/evaluations' }
  },
  {
    eventId: 'event-013',
    sessionId: 'session-003',
    appUsername: 'maria_garcia',
    eventType: 'interaction',
    eventName: 'card_click',
    timestamp: generateDate(3, 9, 20),
    context: { page: 'evaluations', component: 'EvaluationCard' },
    properties: { contentId: 'eval-456', contentType: 'evaluation' }
  },
  {
    eventId: 'event-014',
    sessionId: 'session-004',
    appUsername: 'maria_garcia',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(1, 16, 0),
    context: { page: 'evaluation', route: '/evaluation/456' }
  },
  {
    eventId: 'event-015',
    sessionId: 'session-004',
    appUsername: 'maria_garcia',
    eventType: 'event',
    eventName: 'evaluation_completed',
    timestamp: generateDate(1, 16, 30),
    context: { page: 'evaluation', route: '/evaluation/456' },
    properties: { evaluationId: 'eval-456', totalQuestions: 10 }
  },
  {
    eventId: 'event-016',
    sessionId: 'session-005',
    appUsername: 'carlos_rodriguez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(0, 8, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-017',
    sessionId: 'session-005',
    appUsername: 'carlos_rodriguez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(0, 8, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-018',
    sessionId: 'session-005',
    appUsername: 'carlos_rodriguez',
    eventType: 'error',
    eventName: 'api_error',
    timestamp: generateDate(0, 8, 10),
    context: { page: 'dashboard', component: 'DataFetcher' },
    properties: { errorCode: '500', endpoint: '/api/users' }
  },
  {
    eventId: 'event-019',
    sessionId: 'session-006',
    appUsername: 'carlos_rodriguez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(0, 11, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-020',
    sessionId: 'session-006',
    appUsername: 'carlos_rodriguez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(0, 11, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-021',
    sessionId: 'session-006',
    appUsername: 'carlos_rodriguez',
    eventType: 'event',
    eventName: 'page_load',
    timestamp: generateDate(0, 11, 3),
    context: { page: 'dashboard', route: '/dashboard' },
    properties: { loadTime: 1250, resourceCount: 15 }
  },
  {
    eventId: 'event-022',
    sessionId: 'session-007',
    appUsername: 'ana_martinez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(4, 13, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-023',
    sessionId: 'session-007',
    appUsername: 'ana_martinez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(4, 13, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-024',
    sessionId: 'session-008',
    appUsername: 'dev',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(0, 9, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-025',
    sessionId: 'session-008',
    appUsername: 'dev',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(0, 9, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-026',
    sessionId: 'session-008',
    appUsername: 'dev',
    eventType: 'interaction',
    eventName: 'button_click',
    timestamp: generateDate(0, 9, 5),
    context: { page: 'dashboard', component: 'SearchButton', elementType: 'button' }
  },
  {
    eventId: 'event-027',
    sessionId: 'session-008',
    appUsername: 'dev',
    eventType: 'interaction',
    eventName: 'input_change',
    timestamp: generateDate(0, 9, 8),
    context: { page: 'dashboard', component: 'SearchInput' },
    properties: { searchType: 'events', queryLength: 8 }
  },
  {
    eventId: 'event-028',
    sessionId: 'session-009',
    appUsername: 'dev',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(0, 12, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-029',
    sessionId: 'session-009',
    appUsername: 'dev',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(0, 12, 2),
    context: { page: 'dashboard', route: '/dashboard' }
  },
  {
    eventId: 'event-030',
    sessionId: 'session-010',
    appUsername: 'luis_fernandez',
    eventType: 'authentication',
    eventName: 'login_success',
    timestamp: generateDate(5, 10, 0),
    context: { page: 'login', component: 'LoginForm' },
    properties: { method: 'email', success: true }
  },
  {
    eventId: 'event-031',
    sessionId: 'session-010',
    appUsername: 'luis_fernandez',
    eventType: 'navigation',
    eventName: 'page_view',
    timestamp: generateDate(5, 10, 2),
    context: { page: 'evaluations', route: '/evaluations' }
  },
  {
    eventId: 'event-032',
    sessionId: 'session-010',
    appUsername: 'luis_fernandez',
    eventType: 'event',
    eventName: 'answer_submitted',
    timestamp: generateDate(5, 10, 15),
    context: { page: 'evaluation', component: 'QuestionForm' },
    properties: { evaluationId: 'eval-789', questionId: 'q-5' }
  }
]

export function getMockSessions() {
  return mockSessions
}

export function getMockEvents() {
  return mockEvents
}

export function getSessionsByUser(appUsername: string) {
  return mockSessions.filter(s => s.appUsername === appUsername)
}

export function getEventsBySession(sessionId: string) {
  return mockEvents.filter(e => e.sessionId === sessionId)
}

export function getEventsByUser(appUsername: string) {
  return mockEvents.filter(e => e.appUsername === appUsername)
}

export function getEventsByType(eventType: string) {
  return mockEvents.filter(e => e.eventType === eventType)
}

export function getEventsByDateRange(startDate: Date, endDate: Date) {
  return mockEvents.filter(e => {
    const eventDate = new Date(e.timestamp)
    return eventDate >= startDate && eventDate <= endDate
  })
}

export function getUniqueUsers() {
  return Array.from(new Set(mockSessions.map(s => s.appUsername)))
}

export function getActiveSessions() {
  return mockSessions.filter(s => s.isActive)
}

export function getTotalEvents() {
  return mockEvents.length
}

export function getTotalSessions() {
  return mockSessions.length
}

export function getEventsCountByType() {
  const counts: Record<string, number> = {}
  mockEvents.forEach(event => {
    counts[event.eventType] = (counts[event.eventType] || 0) + 1
  })
  return counts
}

export function getEventsCountByName() {
  const counts: Record<string, number> = {}
  mockEvents.forEach(event => {
    counts[event.eventName] = (counts[event.eventName] || 0) + 1
  })
  return counts
}

export function getSessionsByDateRange(startDate: Date, endDate: Date) {
  return mockSessions.filter(s => {
    const sessionDate = new Date(s.startTime)
    return sessionDate >= startDate && sessionDate <= endDate
  })
}

