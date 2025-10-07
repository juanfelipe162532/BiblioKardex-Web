# BiblioKardex Web - Arquitectura Mejorada

## Estructura de Servicios

### Servicios Principales

#### 1. API Service (`src/services/api.ts`)
- Servicio base para todas las comunicaciones HTTP
- Manejo centralizado de autenticación (JWT tokens)
- Interceptores para headers comunes (bibliotecaId, email)
- Manejo de errores unificado

#### 2. Servicios Especializados
- **Books Service**: Gestión de libros (CRUD + búsqueda)
- **Loans Service**: Gestión de préstamos (CRUD + escaneo IA)
- **Readers Service**: Gestión de lectores/usuarios (CRUD + búsqueda)
- **Libraries Service**: Gestión de bibliotecas + estadísticas
- **Analysis Service**: Integración con IA para análisis de imágenes

### Stores (Pinia)

#### Características Comunes
- Estado reactivo con loading, error, paginación
- Acciones CRUD completas
- Computed values para filtros y agregaciones
- Manejo de errores consistente

#### Stores Implementados
1. **Auth Store**: Autenticación y usuario actual
2. **Dashboard Store**: Estadísticas generales
3. **Books Store**: Estado de libros con filtros y búsqueda
4. **Loans Store**: Estado de préstamos con estados
5. **Readers Store**: Estado de lectores con tipos
6. **Libraries Store**: Estado de bibliotecas
7. **Analysis Store**: Estado de análisis IA

## Endpoints del Backend Disponibles

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Perfil del usuario

### Libros
- `GET /api/libros` - Lista paginada (alias español)
- `POST /api/books` - Crear libro
- `GET /api/books/:id` - Obtener libro
- `PATCH /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Préstamos
- `GET /api/prestamos` - Lista paginada (alias español)
- `POST /api/loans` - Crear préstamo
- `POST /api/loans/scan` - Crear préstamo desde imagen IA
- `GET /api/loans/:id` - Obtener préstamo
- `PATCH /api/loans/:id` - Actualizar préstamo
- `DELETE /api/loans/:id` - Eliminar préstamo

### Lectores/Usuarios
- `GET /api/lectores` - Lista paginada (alias español)
- `POST /api/borrowers` - Crear lector
- `GET /api/borrowers/search` - Búsqueda de lectores
- `GET /api/borrowers/:id` - Obtener lector
- `PATCH /api/borrowers/:id` - Actualizar lector
- `DELETE /api/borrowers/:id` - Eliminar lector

### Bibliotecas
- `GET /api/bibliotecas/:id` - Información de biblioteca (alias español)
- `PUT /api/bibliotecas/:id` - Actualizar biblioteca (alias español)
- `POST /api/libraries` - Crear biblioteca
- `GET /api/libraries` - Lista de bibliotecas
- `DELETE /api/libraries/:id` - Eliminar biblioteca

### Estadísticas
- `GET /api/estadisticas/:bibliotecaId` - Estadísticas de biblioteca

### IA/Análisis
- `POST /api/analysis/analyze` - Analizar imagen con IA
- `GET /api/analysis/status` - Estado del sistema de análisis
- `GET /api/analysis/health` - Health check del sistema IA

### Auditoría
- `GET /api/audit-logs` - Logs de auditoría
- `GET /api/audit-logs/:id` - Log específico

## Componentes de Ejemplo

### BooksManagementView.vue
Demuestra la integración completa:
- Uso de múltiples stores (books, auth, analysis, loans)
- CRUD completo con formularios
- Búsqueda y filtrado
- Integración con IA para escaneo
- Manejo de estados de carga y error
- Paginación

## Tipos TypeScript

### Interfaces Principales
```typescript
interface Book {
  id: string
  titulo: string
  autor: string
  isbn?: string
  categoria?: string
  disponible: boolean
  fechaCreacion: string
  bibliotecaId: string
}

interface CreateBookRequest {
  titulo: string
  autor: string
  isbn?: string
  categoria?: string
  descripcion?: string
  ubicacion?: string
  bibliotecaId: string
}

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  status?: string
}

interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}
```

## Configuración de Entorno

### Variables de Entorno
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Mejoras Implementadas

1. **Arquitectura Modular**: Separación clara entre servicios y stores
2. **TypeScript Completo**: Tipado fuerte en toda la aplicación
3. **Manejo de Errores**: Sistema unificado de manejo de errores
4. **Estados de Carga**: Estados reactivos para mejor UX
5. **Paginación**: Implementación completa de paginación
6. **Búsqueda y Filtros**: Sistema flexible de búsqueda
7. **Integración IA**: Conexión completa con el sistema de análisis
8. **Responsive Design**: Diseño adaptativo para móviles

## Próximos Pasos

1. Implementar más vistas usando los stores creados
2. Agregar validación de formularios más robusta
3. Implementar notificaciones toast
4. Agregar tests unitarios
5. Implementar PWA capabilities
6. Agregar internacionalización