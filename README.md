# 🧠 Psy Reservations Service

Un servicio de reservas para sesiones psicológicas construido con NestJS, PostgreSQL y Prisma.

## 📋 Descripción

Este servicio permite gestionar reservas de sesiones psicológicas, incluyendo:

- **Gestión de Terapeutas**: Perfiles con zonas horarias y especialidades
- **Catálogo de Temas**: Especialidades terapéuticas disponibles
- **Tipos de Sesión**: Diferentes duraciones, precios y modalidades (online/in-person)
- **Ventanas de Disponibilidad**: Horarios disponibles por terapeuta y modalidad
- **Filtrado Avanzado**: Búsqueda de terapeutas por temas, modalidad y paginación
- **Gestión de Disponibilidad**: Ventanas de tiempo disponibles por terapeuta y modalidad
- **Servicios de Tiempo**: Conversión de zonas horarias y manejo de DST
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
├── therapists/      # Gestión de terapeutas y disponibilidad
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

- `GET /therapists` - Lista de terapeutas con filtros avanzados
- `GET /therapists/:id` - Perfil del terapeuta con temas y modalidades
- `GET /therapists/:id/session-types` - Tipos de sesión del terapeuta
- `GET /therapists/:id/availability` - Disponibilidad del terapeuta para una semana específica

#### Filtros Disponibles

````bash
# Filtrado por temas (OR logic)
GET /therapists?topicIds=1,2,3

# Filtrado por temas (AND logic)
GET /therapists?topicIds=1,2,3&requireAll=true

# Filtrado por modalidad
GET /therapists?modality=online
GET /therapists?modality=in_person

# Paginación
GET /therapists?limit=10&offset=0

# Combinación de filtros
GET /therapists?topicIds=1,2&modality=online&limit=5&offset=0

#### Endpoint de Disponibilidad

```bash
# Obtener disponibilidad para una semana específica
GET /therapists/:id/availability?weekStart=2024-01-15&sessionTypeId=123&patientTz=America/New_York&stepMin=15

# Parámetros:
# - weekStart: Fecha de inicio de la semana (YYYY-MM-DD)
# - sessionTypeId: ID del tipo de sesión
# - patientTz: Zona horaria del paciente
# - stepMin: Intervalo de discretización (opcional, default: 15)
````

### Documentación Swagger

- `GET /api` - Documentación interactiva de la API

## 🗄️ Modelos de Datos

### Therapist

```typescript
{
  id: string;
  name: string;
  timezone: string;
  topics: Topic[];
  modalities: ('online' | 'in_person')[];
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
  modality: 'online' | 'in_person'
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
  modality: 'online' | 'in_person';
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

## 🔍 Funcionalidades de Filtrado

### Filtrado por Temas

```bash
# Buscar terapeutas que tengan CUALQUIERA de los temas (OR)
GET /therapists?topicIds=anxiety,depression

# Buscar terapeutas que tengan TODOS los temas (AND)
GET /therapists?topicIds=anxiety,depression&requireAll=true
```

### Filtrado por Modalidad

```bash
# Solo terapeutas que ofrezcan sesiones online
GET /therapists?modality=online

# Solo terapeutas que ofrezcan sesiones presenciales
GET /therapists?modality=in_person
```

### Paginación

```bash
# Primeros 10 resultados
GET /therapists?limit=10&offset=0

# Siguientes 10 resultados
GET /therapists?limit=10&offset=10
```

### Combinación de Filtros

```bash
# Terapeutas con temas específicos, modalidad online, paginado
GET /therapists?topicIds=anxiety,depression&modality=online&limit=5&offset=0
```

## 🧪 Testing

El proyecto incluye tests unitarios completos para:

- **Controllers**: Tests de endpoints con mocks
- **Services**: Tests de lógica de negocio, filtrado y disponibilidad
- **DTOs**: Tests de validación y transformación de datos
- **Time Services**: Tests de conversión de zonas horarias y DST
- **Availability Services**: Tests de generación de ventanas de disponibilidad
- **Edge Cases**: Casos de error y validaciones

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- --testPathPattern=topics
npm test -- --testPathPattern=therapists
npm test -- --testPathPattern=availability
npm test -- --testPathPattern=time
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
- [x] Módulo de therapists con filtrado avanzado
- [x] Sistema de modalidades (online/in-person)
- [x] Filtrado por temas con lógica AND/OR
- [x] Filtrado por modalidad
- [x] Paginación de resultados
- [x] Tests unitarios completos (99 tests)
- [x] Filtros globales de excepciones
- [x] Validación de datos con class-validator
- [x] Seeds de datos de ejemplo con modalidades
- [x] TimeService para manejo de zonas horarias y DST
- [x] AvailabilityService para gestión de ventanas de disponibilidad
- [x] Endpoint de disponibilidad con discretización de slots
- [x] Conversión de zonas horarias para pacientes
- [x] Detección de solapamientos con sesiones existentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autor

- **Lucas Della Sala** - [@lucasdellasala](https://github.com/lucasdellasala)
