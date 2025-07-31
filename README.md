# 🧠 Psy Reservations Service

Un servicio de reservas para sesiones psicológicas construido con NestJS, PostgreSQL y Prisma.

## 📋 Descripción

Este servicio permite gestionar reservas de sesiones psicológicas, incluyendo:

- **Gestión de Terapeutas**: Perfiles con zonas horarias y especialidades
- **Catálogo de Temas**: Especialidades terapéuticas disponibles
- **Tipos de Sesión**: Diferentes duraciones y precios
- **Ventanas de Disponibilidad**: Horarios disponibles por terapeuta
- **Reservas**: Sistema de reservas con estados (pendiente, confirmado, cancelado)

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Logging**: Pino
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator, class-transformer
- **Testing**: Jest

### Estructura del Proyecto

```
src/
├── common/           # Módulo común (filtros, pipes, interceptors)
├── config/          # Configuración de entorno
├── health/          # Health checks
├── logger/          # Sistema de logging
├── prisma/          # Servicio de base de datos
├── swagger/         # Configuración de documentación
├── therapists/      # Gestión de terapeutas
├── topics/          # Catálogo de temas
└── main.ts          # Punto de entrada
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL
- npm o yarn

### 1. Clonar y Instalar

```bash
git clone https://github.com/lucasdellasala/psy-reservations-service.git
cd psy-reservations-service
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env`:

```env
PORT=3000
NODE_ENV=development
TZ=UTC
DATABASE_URL=postgresql://postgres:password@localhost:5432/psy_reservations
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos
createdb psy_reservations

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos de ejemplo
npm run db:seed
```

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
# Servidor de desarrollo
npm run start:dev

# Build del proyecto
npm run build

# Formatear código
npm run format

# Linting
npm run lint
npm run lint:check
```

### Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio

# Poblar con datos de ejemplo
npm run db:seed

# Resetear base de datos
npm run db:reset
```

### Testing

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📚 API Endpoints

### Health Check

- `GET /health` - Estado del servicio

### Topics (Temas)

- `GET /topics` - Lista de temas disponibles

### Therapists (Terapeutas)

- `GET /therapists/:id` - Perfil del terapeuta con temas
- `GET /therapists/:id/session-types` - Tipos de sesión del terapeuta

### Documentación Swagger

- `GET /api` - Documentación interactiva de la API

## 🗄️ Modelos de Datos

### Therapist

```typescript
{
  id: string;
  name: string;
  timezone: string;
  createdAt: DateTime;
}
```

### Topic

```typescript
{
  id: string;
  name: string;
}
```

### SessionType

```typescript
{
  id: string
  therapistId: string
  name: string
  durationMin: number
  priceMinor?: number
}
```

### AvailabilityWindow

```typescript
{
  id: string;
  therapistId: string;
  weekday: number;
  startMin: number;
  endMin: number;
}
```

### Session

```typescript
{
  id: string
  therapistId: string
  sessionTypeId: string
  patientId: string
  patientName?: string
  patientEmail?: string
  startUtc: DateTime
  endUtc: DateTime
  patientTz: string
  status: 'pending' | 'confirmed' | 'canceled'
  idempotencyKey?: string
  createdAt: DateTime
  canceledAt?: DateTime
}
```

## 🧪 Testing

El proyecto incluye tests unitarios completos para:

- **Controllers**: Tests de endpoints con mocks
- **Services**: Tests de lógica de negocio
- **Edge Cases**: Casos de error y validaciones

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- --testPathPattern=topics
npm test -- --testPathPattern=therapists
```

## 🔧 Configuración de Desarrollo

### Herramientas de Calidad

- **ESLint**: Análisis estático de código
- **Prettier**: Formateo automático
- **Husky**: Git hooks
- **lint-staged**: Linting en commits

## 📊 Estado del Proyecto

### ✅ Implementado

- [x] Configuración base de NestJS
- [x] Sistema de logging con Pino
- [x] Documentación Swagger
- [x] Base de datos PostgreSQL con Prisma
- [x] Módulo de health checks
- [x] Módulo de topics
- [x] Módulo de therapists
- [x] Tests unitarios completos
- [x] Filtros globales de excepciones
- [x] Validación de datos
- [x] Seeds de datos de ejemplo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autor

- **Lucas Della Sala** - [@lucasdellasala](https://github.com/lucasdellasala)
