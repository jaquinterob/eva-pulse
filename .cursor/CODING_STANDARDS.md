# Estándares de Código - Eva Pulse

Este documento define las prácticas y estándares de código que deben seguirse en todo el proyecto. **Este archivo debe ser consultado antes de escribir cualquier código nuevo o modificar código existente.**

## 📋 Tabla de Contenidos

1. [Principios Generales](#principios-generales)
2. [TypeScript](#typescript)
3. [Estructura de Código](#estructura-de-código)
4. [Nomenclatura](#nomenclatura)
5. [Documentación](#documentación)
6. [Sistema de Tema](#sistema-de-tema)
7. [API Routes](#api-routes)
8. [Componentes React](#componentes-react)
9. [Manejo de Errores](#manejo-de-errores)
10. [Testing](#testing)
11. [Performance](#performance)

---

## 🎯 Principios Generales

### Clean Code
- **Código autoexplicativo**: El código debe ser legible sin necesidad de comentarios
- **DRY (Don't Repeat Yourself)**: Evitar duplicación de código
- **KISS (Keep It Simple, Stupid)**: Soluciones simples y directas
- **SOLID**: Aplicar principios SOLID especialmente en servicios y utilidades
- **Single Responsibility**: Cada función/clase debe tener una única responsabilidad

### Reglas de Oro
1. **NO comentarios en español** - El código debe ser autoexplicativo
2. **Solo JSDoc** para servicios públicos, funciones complejas y tipos exportados
3. **Nombres descriptivos** - Variables y funciones deben explicar su propósito
4. **Funciones pequeñas** - Máximo 50 líneas, preferiblemente menos de 30
5. **Sin código muerto** - Eliminar código comentado o no utilizado
6. **TypeScript estricto** - Usar tipos explícitos, evitar `any`

---

## 📘 TypeScript

### Tipos y Interfaces

```typescript
// ✅ CORRECTO: Interfaces para objetos
interface User {
  id: string
  name: string
  email: string
}

// ✅ CORRECTO: Types para uniones, intersecciones, etc.
type Status = 'pending' | 'completed' | 'failed'
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

// ❌ INCORRECTO: Usar any
function processData(data: any) { }

// ✅ CORRECTO: Tipos explícitos
function processData(data: User | Product) { }
```

### Configuración TypeScript
- `strict: true` - Siempre activado
- `noImplicitAny: true` - Prohibir any implícito
- `strictNullChecks: true` - Manejo explícito de null/undefined
- Usar `as const` para literales cuando sea apropiado

### Tipos de Retorno
- **Siempre** especificar tipos de retorno en funciones públicas
- Usar `Promise<T>` para funciones asíncronas
- Evitar `void` cuando sea posible, preferir tipos específicos

```typescript
// ✅ CORRECTO
async function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ INCORRECTO
async function getUser(id: string) {
  // ...
}
```

---

## 🏗️ Estructura de Código

### Organización de Archivos

```
app/
  api/
    [resource]/
      route.ts          # Solo handlers HTTP
  (pages)/              # Route group para páginas (opcional)
    [page-name]/
      page.tsx          # Páginas de la aplicación
  page.tsx              # Página raíz (/)
  layout.tsx            # Layout principal
  globals.css           # Estilos globales
components/
  ui/
    [ComponentName]/
      index.tsx         # Componentes reutilizables de UI
      types.ts          # Tipos específicos del componente
  [FeatureComponent]/
    index.tsx           # Componentes específicos de features
lib/
  services/             # Lógica de negocio
  utils/                # Utilidades puras
  config/               # Configuraciones (tema, etc.)
  hooks/                # Custom hooks
  constants/            # Constantes
types/
  index.ts              # Tipos globales
```

**Nota sobre Next.js App Router:**
- `app/page.tsx` es la ruta raíz `/`
- Para otras rutas, crear `app/[route]/page.tsx` (ej: `app/dashboard/page.tsx` → `/dashboard`)
- Usar route groups `(pages)` solo si necesitas organización adicional sin afectar URLs

### Reglas de Estructura: Pages vs UI Components

#### 📄 `app/pages/` - Páginas de la Aplicación

**Usar `app/pages/` cuando:**
- Es una ruta completa de la aplicación (ej: `/home`, `/dashboard`, `/profile`)
- Contiene lógica específica de esa página
- Es una vista completa con su propio layout o estructura
- Tiene metadata específica (title, description, etc.)
- Puede tener sus propios componentes específicos en la misma carpeta

**Estructura de una página:**
```
app/
  page.tsx              # Página raíz (/)
  dashboard/
    page.tsx            # Página /dashboard
    components/         # Componentes específicos de esta página (opcional)
      DashboardHeader.tsx
    layout.tsx          # Layout específico del dashboard (opcional)
  profile/
    page.tsx            # Página /profile
```

**Ejemplo:**
```typescript
// app/dashboard/page.tsx
import { Metadata } from 'next'
import { DashboardHeader } from './components/DashboardHeader'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Dashboard - Eva Pulse',
}

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />
      <Button>Click me</Button>
    </div>
  )
}
```

#### 🎨 `components/ui/` - Componentes Reutilizables

**Usar `components/ui/` cuando:**
- El componente es reutilizable en múltiples páginas
- Es un componente de UI genérico (botones, inputs, cards, modals, etc.)
- No tiene lógica de negocio específica
- Puede ser usado en diferentes contextos
- Es parte de un sistema de diseño

**Componentes que van en `ui/`:**
- Botones, Inputs, Forms
- Cards, Modals, Dialogs
- Navigation, Menus
- Icons, Badges, Tooltips
- ThemeToggle, ThemeProvider
- Cualquier componente de UI genérico

**Estructura de un componente UI:**
```
components/ui/
  Button/
    index.tsx
    types.ts
  Card/
    index.tsx
    types.ts
  ThemeToggle/
    index.tsx
```

**Ejemplo:**
```typescript
// components/ui/Button/index.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--primary)' : 'var(--secondary)',
        // ...
      }}
    >
      {children}
    </button>
  )
}
```

#### 🧩 `components/` (raíz) - Componentes de Features

**Usar `components/` (fuera de ui) cuando:**
- Es un componente específico de una feature/business logic
- Combina múltiples componentes UI
- Tiene lógica de negocio específica
- Es un componente complejo que agrupa funcionalidad

**Ejemplo:**
```
components/
  UserProfile/          # Componente complejo de feature
    index.tsx
    UserAvatar.tsx
    UserInfo.tsx
  ProductList/          # Componente de feature
    index.tsx
    ProductCard.tsx
```

### Decision Tree: ¿Dónde va mi componente?

```
¿Es una ruta completa de la app?
├─ SÍ → app/[route]/page.tsx (ej: app/dashboard/page.tsx)
└─ NO → ¿Es un componente de UI reutilizable?
    ├─ SÍ → components/ui/[ComponentName]/
    └─ NO → ¿Es un componente de feature complejo?
        ├─ SÍ → components/[FeatureComponent]/
        └─ NO → Revisar si debería ser parte de una página existente
```

### Reglas Importantes

1. **NUNCA** poner componentes UI en `app/pages/`
2. **NUNCA** poner páginas en `components/ui/`
3. **SIEMPRE** importar componentes UI desde `@/components/ui/`
4. **SIEMPRE** usar estructura de carpetas consistente
5. **SIEMPRE** exportar componentes UI con `export function` o `export default`

### Orden de Imports

1. Dependencias externas (React, Next.js, etc.)
2. Dependencias internas (@/lib, @/types, etc.)
3. Imports relativos (./, ../)

```typescript
// ✅ CORRECTO
import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/mock-db'
import type { User, ApiResponse } from '@/types'
import { validateEmail } from './utils'
```

### Exportaciones

- Usar `export` nombrado para funciones/constantes
- Usar `export default` solo para componentes React
- Preferir `export type` para tipos

```typescript
// ✅ CORRECTO
export function calculateTotal(items: Item[]): number { }
export type { User, Product }
export default UserList

// ❌ INCORRECTO
export const calculateTotal = (items: Item[]) => { }
```

---

## 📝 Nomenclatura

### Variables y Funciones

```typescript
// ✅ CORRECTO: camelCase para variables y funciones
const userName = 'John'
function getUserById(id: string) { }

// ✅ CORRECTO: PascalCase para clases, interfaces, tipos, componentes
class UserService { }
interface UserData { }
type UserStatus = 'active' | 'inactive'
export default function UserCard() { }

// ✅ CORRECTO: UPPER_SNAKE_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'

// ✅ CORRECTO: Nombres descriptivos
const isUserActive = true
const hasValidEmail = validateEmail(email)
function findUserByEmail(email: string) { }
```

### Archivos y Carpetas

- **Componentes**: `PascalCase.tsx` → `UserCard.tsx`
- **Utilidades/Servicios**: `camelCase.ts` → `userService.ts`
- **Tipos**: `camelCase.ts` → `userTypes.ts`
- **Constantes**: `camelCase.ts` → `apiConstants.ts`
- **Carpetas**: `kebab-case` → `user-management/`

### Booleanos

```typescript
// ✅ CORRECTO: Prefijos is, has, should, can
const isActive = true
const hasPermission = false
const shouldRetry = true
const canEdit = false

// ❌ INCORRECTO
const active = true
const permission = false
```

---

## 📚 Documentación

### JSDoc - Cuándo Usar

**SÍ documentar con JSDoc:**
- Funciones públicas de servicios
- Funciones complejas con lógica no obvia
- Tipos/interfaces exportados
- Parámetros opcionales o con valores por defecto complejos

**NO documentar:**
- Funciones simples y autoexplicativas
- Variables locales
- Props de componentes simples
- Handlers HTTP básicos

### Formato JSDoc

```typescript
/**
 * Retrieves a user by their unique identifier.
 * 
 * @param id - The unique identifier of the user
 * @returns The user object if found, null otherwise
 * @throws {Error} If the database connection fails
 */
async function getUserById(id: string): Promise<User | null> {
  // ...
}

/**
 * Calculates the total price including taxes and discounts.
 * 
 * @param items - Array of items with price and quantity
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param discount - Optional discount percentage (0-100)
 * @returns Final total price rounded to 2 decimals
 */
function calculateTotal(
  items: Item[],
  taxRate: number,
  discount?: number
): number {
  // ...
}
```

### Comentarios Prohibidos

```typescript
// ❌ INCORRECTO: Comentarios explicativos
// Obtener usuario de la base de datos
const user = await getUser(id)

// ❌ INCORRECTO: Comentarios TODO sin contexto
// TODO: mejorar esto

// ✅ CORRECTO: Código autoexplicativo
const user = await userService.findById(id)

// ✅ CORRECTO: TODO con contexto (solo si es necesario)
// TODO: Add caching layer to improve performance (Issue #123)
```

---

## 🎨 Sistema de Tema

### Reglas Obligatorias de Tema

**CRÍTICO**: El sistema de tema es **OBLIGATORIO** y debe implementarse en **TODAS** las pantallas y componentes.

1. **Configuración Centralizada**: El tema se administra exclusivamente desde `lib/config/theme.ts`
2. **Dark/Light Mode**: Todas las pantallas DEBEN soportar ambos modos
3. **Variables CSS**: Usar siempre variables CSS del tema, NUNCA colores hardcodeados
4. **ThemeProvider**: Todos los componentes deben estar dentro del ThemeProvider
5. **Consistencia**: Los colores deben venir del sistema de tema, no definirse localmente

### Estructura del Sistema de Tema

```
lib/
  config/
    theme.ts          # Configuración centralizada del tema
  hooks/
    useTheme.ts       # Hook para manejo del tema
components/
  ThemeProvider.tsx   # Provider del tema
  ThemeToggle.tsx     # Componente para cambiar tema
```

### Uso de Variables CSS

```typescript
// ✅ CORRECTO: Usar variables CSS del tema
<div style={{
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  border: '1px solid var(--border)'
}}>

// ❌ INCORRECTO: Colores hardcodeados
<div style={{
  backgroundColor: '#ffffff',
  color: '#000000',
  border: '1px solid #e2e8f0'
}}>
```

### Componentes con Tema

```typescript
'use client'

import { useThemeContext } from '@/components/ThemeProvider'

export default function MyComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid var(--border)'
    }}>
      <h2 style={{ color: 'var(--primary)' }}>Title</h2>
      <p style={{ color: 'var(--muted-foreground)' }}>Description</p>
    </div>
  )
}
```

### Reglas Específicas

1. **NUNCA** usar colores hexadecimales o RGB directamente en componentes
2. **SIEMPRE** usar variables CSS: `var(--variable-name)`
3. **TODOS** los componentes deben funcionar en dark y light mode
4. **SIEMPRE** probar ambos modos antes de hacer commit
5. **NUNCA** crear nuevos colores fuera de `theme.ts`

### Variables CSS Disponibles

- `--background`: Color de fondo principal
- `--foreground`: Color de texto principal
- `--primary`: Color primario de la aplicación
- `--primary-foreground`: Color de texto sobre primario
- `--secondary`: Color secundario
- `--secondary-foreground`: Color de texto sobre secundario
- `--muted`: Color de fondo muted
- `--muted-foreground`: Color de texto muted
- `--accent`: Color de acento
- `--accent-foreground`: Color de texto sobre acento
- `--border`: Color de bordes
- `--input`: Color de inputs
- `--ring`: Color de focus ring
- `--card`: Color de fondo de cards
- `--card-foreground`: Color de texto en cards
- `--destructive`: Color destructivo (errores, eliminar)
- `--destructive-foreground`: Color de texto sobre destructivo

### Modificar el Tema

**IMPORTANTE**: Para modificar colores del tema, editar ÚNICAMENTE `lib/config/theme.ts`. Los cambios se aplicarán automáticamente a toda la aplicación.

```typescript
// ✅ CORRECTO: Modificar en theme.ts
export const themeConfig: ThemeConfig = {
  light: {
    primary: '#nuevo-color', // Cambio aquí afecta toda la app
    // ...
  },
  dark: {
    primary: '#nuevo-color-dark',
    // ...
  }
}
```

### Checklist de Tema

Antes de hacer commit, verificar:
- [ ] Todos los componentes usan variables CSS del tema
- [ ] No hay colores hardcodeados
- [ ] El componente funciona en dark mode
- [ ] El componente funciona en light mode
- [ ] Las transiciones de tema son suaves
- [ ] El tema se persiste en localStorage

---

## 🔌 API Routes

### Estructura de Handlers

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { resourceService } from '@/lib/services/resourceService'
import type { ApiResponse, Resource } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Validación de parámetros
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    // Lógica de negocio delegada a servicio
    const resource = await resourceService.findById(id)
    
    if (!resource) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<Resource>>({
      success: true,
      data: resource,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Reglas para API Routes

1. **Validación temprana**: Validar inputs al inicio
2. **Delegar lógica**: La lógica de negocio va en servicios, no en handlers
3. **Manejo de errores consistente**: Siempre retornar formato ApiResponse
4. **Códigos HTTP correctos**: 200, 201, 400, 404, 500
5. **Tipos explícitos**: Usar tipos genéricos en NextResponse.json

---

## ⚛️ Componentes React

### Estructura de Componentes

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { User } from '@/types'
import { userService } from '@/lib/services/userService'
import styles from './UserCard.module.css'

interface UserCardProps {
  userId: string
  onUserUpdate?: (user: User) => void
}

export default function UserCard({ userId, onUserUpdate }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [userId])

  async function loadUser() {
    setIsLoading(true)
    try {
      const data = await userService.findById(userId)
      setUser(data)
      onUserUpdate?.(data)
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div className={styles.card}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### Reglas para Componentes

1. **Props tipadas**: Siempre definir interface para props
2. **Hooks al inicio**: Todos los hooks antes de cualquier lógica
3. **Early returns**: Para estados de carga y errores
4. **Funciones internas**: Usar `function` en lugar de arrow functions para mejor debugging
5. **CSS Modules**: Preferir CSS Modules sobre estilos inline cuando sea posible

---

## ⚠️ Manejo de Errores

### Try-Catch

```typescript
// ✅ CORRECTO: Manejo específico de errores
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
  
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}

// ❌ INCORRECTO: Catch genérico sin manejo
try {
  await operation()
} catch (error) {
  // ...
}
```

### Validación

```typescript
// ✅ CORRECTO: Validación temprana y clara
function createUser(data: CreateUserDto): User {
  if (!data.email || !isValidEmail(data.email)) {
    throw new ValidationError('Invalid email format')
  }
  
  if (data.name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters')
  }
  
  return userDb.create(data)
}
```

---

## 🧪 Testing

### Estructura de Tests

```typescript
describe('UserService', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      const user = await userService.findById('1')
      expect(user).toBeDefined()
      expect(user?.id).toBe('1')
    })

    it('should return null when user not found', async () => {
      const user = await userService.findById('999')
      expect(user).toBeNull()
    })
  })
})
```

---

## ⚡ Performance

### Optimizaciones

1. **Lazy loading**: Usar `dynamic` import para componentes pesados
2. **Memoización**: Usar `useMemo` y `useCallback` cuando sea necesario
3. **Imágenes**: Usar componente `Image` de Next.js
4. **API Routes**: Cachear respuestas cuando sea apropiado

```typescript
// ✅ CORRECTO: Lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
})

// ✅ CORRECTO: Memoización cuando sea necesario
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

---

## ✅ Checklist Antes de Commit

- [ ] Código sigue principios SOLID
- [ ] No hay comentarios innecesarios
- [ ] JSDoc solo donde es necesario
- [ ] Todos los tipos están definidos (no `any`)
- [ ] Funciones son pequeñas y con responsabilidad única
- [ ] Nombres son descriptivos y siguen convenciones
- [ ] Manejo de errores implementado
- [ ] Validaciones en lugar correcto
- [ ] **Estructura correcta**: Componente está en la carpeta correcta (pages vs ui)
- [ ] **Tema implementado**: Todos los componentes usan variables CSS del tema
- [ ] **Dark/Light mode**: Componente funciona en ambos modos
- [ ] **Sin colores hardcodeados**: Solo variables CSS del tema
- [ ] ESLint pasa sin errores
- [ ] TypeScript compila sin errores

---

## 🔧 Herramientas

- **ESLint**: Linting y reglas de código
- **TypeScript**: Type checking estricto
- **Prettier**: Formateo automático (opcional pero recomendado)

---

**Última actualización**: 2024-12-04
**Versión**: 1.0.0

