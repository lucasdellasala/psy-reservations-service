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
- **Sistema de Reservas**: Creación de sesiones con idempotencia y control de concurrencia
- **Control de Concurrencia**: Locks por terapeuta para evitar conflictos
- **Validación de Disponibilidad**: Verificación automática de ventanas y solapamientos
- **Gestión de Sesiones**: Obtener y cancelar sesiones con conversión de zonas horarias
- **Jobs Periódicos**: Cancelación automática de sesiones pendientes expiradas
- **Cálculo de Disponibilidad**: Conteo de slots libres por terapeuta y ordenamiento por escasez

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
├── sessions/        # Sistema de reservas y sesiones
├── jobs/            # Jobs periódicos y tareas automáticas
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
# Puerto del servidor
PORT=5000

# Entorno
NODE_ENV=development

# Zona horaria
TZ=UTC

# Base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/psy_reservations

# Configuración de CORS

# O usar variables individuales
CORS_ORIGIN_1=https://mi-app.com
CORS_ORIGIN_2=https://staging.mi-app.com
CORS_ORIGIN_3=https://admin.mi-app.com
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

### 4. Configuración de CORS

El servicio incluye configuración flexible de CORS que permite:

- **Orígenes por defecto**: `localhost:3000`, `127.0.0.1:3000`, `localhost:3001`, `127.0.0.1:3001`
- **Orígenes adicionales**: Usar `CORS_ORIGIN_1`, `CORS_ORIGIN_2`, etc.
- **Logging**: Los orígenes configurados se muestran en consola al iniciar

```bash

# O usar variables individuales
CORS_ORIGIN_1=https://mi-app.com
CORS_ORIGIN_2=https://staging.mi-app.com
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

### Sessions (Sesiones)

- `POST /sessions` - Crear una nueva sesión con idempotencia
- `GET /sessions/:id` - Obtener detalles de una sesión con conversión de zonas horarias
- `PATCH /sessions/:id/cancel` - Cancelar una sesión (idempotente)

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

# Cálculo de disponibilidad y ordenamiento por escasez
GET /therapists?weekStart=2025-01-27&sessionTypeId=st1&stepMin=15&orderBy=scarcity

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

#### Endpoint de Sesiones

````bash
# Crear una nueva sesión
POST /sessions
Headers:
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json

Body:
{
  "therapistId": "cmdqpytum000buyfo2i65xv5x",
  "sessionTypeId": "cmdqpyvkw000yuyfofb47i1dx",
  "startUtc": "2025-01-29T20:00:00Z",
  "patientId": "user123",
  "patientName": "Lucas",
  "patientEmail": "lucas@mail.com",
  "patientTz": "America/Argentina/Buenos_Aires"
}

# Respuestas:
# - 201: Sesión creada exitosamente
# - 200: Sesión ya existe (idempotencia)
# - 409: SLOT_TAKEN - Horario ocupado
# - 422: OUT_OF_WINDOW - Fuera de ventana disponible
# - 400: Datos inválidos o Idempotency-Key faltante

#### Endpoints de Gestión de Sesiones

```bash
# Obtener detalles de una sesión
GET /sessions/:id

# Respuesta incluye:
# - Todos los campos de la sesión
# - startInPatientTz y endInPatientTz (convertidos a zona horaria del paciente)
# - Información del tipo de sesión

# Cancelar una sesión (idempotente)
PATCH /sessions/:id/cancel

# Respuestas:
# - 200: Sesión cancelada exitosamente o ya estaba cancelada
# - 404: Sesión no encontrada
````

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
  availabilitySummary?: {
    freeSlotsCount: number;
  };
  createdAt: DateTime;
}
````

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
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED'
  idempotencyKey?: string
  createdAt: DateTime
  canceledAt?: DateTime
  sessionType?: {
    name: string
    durationMin: number
    modality: 'online' | 'in_person'
  }
  startInPatientTz?: string
  endInPatientTz?: string
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

## 🔒 Sistema de Reservas

### Características Principales

- **Idempotencia**: Garantiza que múltiples requests con el mismo `Idempotency-Key` no creen sesiones duplicadas
- **Control de Concurrencia**: Locks por terapeuta usando `pg_advisory_xact_lock` para evitar conflictos
- **Validación de Disponibilidad**: Verifica que la sesión encaje en una ventana disponible
- **Detección de Solapamientos**: Previene reservas que se superpongan con sesiones existentes
- **Conversión de Zonas Horarias**: Maneja automáticamente las zonas horarias de pacientes
- **Gestión de Sesiones**: Obtener y cancelar sesiones con conversión automática de zonas horarias
- **Jobs Periódicos**: Cancelación automática de sesiones pendientes que han expirado

### Flujo de Creación de Sesión

1. **Validación de Idempotencia**: Verifica si ya existe una sesión con el mismo `Idempotency-Key`
2. **Obtención de Datos**: Recupera `durationMin` y `modality` del `SessionType`
3. **Cálculo de Horarios**: Calcula `endUtc` basado en `startUtc` + `durationMin`
4. **Validación de Ventana**: Verifica que el horario encaje en una `AvailabilityWindow`
5. **Lock de Terapeuta**: Adquiere lock para evitar conflictos concurrentes
6. **Verificación de Solapamientos**: Usa `hasOverlap` para detectar conflictos
7. **Creación de Sesión**: Inserta la sesión con estado `CONFIRMED`

### Jobs Periódicos

El sistema incluye un job que se ejecuta cada 5 minutos para:

- **Buscar sesiones expiradas**: Sesiones con `status = 'PENDING'` donde `startUtc < now()`
- **Cancelación automática**: Actualiza a `status = 'CANCELED'` y establece `canceledAt = now()`
- **Logging detallado**: Registra cantidad de sesiones canceladas y detalles de cada una
- **Manejo de errores**: Continúa ejecutándose aunque falle el procesamiento de algunos terapeutas

## 🧪 Testing

El proyecto incluye tests unitarios completos para:

- **Controllers**: Tests de endpoints con mocks
- **Services**: Tests de lógica de negocio, filtrado y disponibilidad
- **DTOs**: Tests de validación y transformación de datos
- **Time Services**: Tests de conversión de zonas horarias y DST
- **Availability Services**: Tests de generación de ventanas de disponibilidad
- **Session Services**: Tests de creación de sesiones y validaciones
- **Jobs Services**: Tests de jobs periódicos y cancelación automática
- **Edge Cases**: Casos de error y validaciones

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- --testPathPattern=topics
npm test -- --testPathPattern=therapists
npm test -- --testPathPattern=availability
npm test -- --testPathPattern=time
npm test -- --testPathPattern=sessions
npm test -- --testPathPattern=jobs
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
- [x] Tests unitarios completos (130+ tests)
- [x] Filtros globales de excepciones
- [x] Validación de datos con class-validator
- [x] Seeds de datos de ejemplo con modalidades
- [x] TimeService para manejo de zonas horarias y DST
- [x] AvailabilityService para gestión de ventanas de disponibilidad
- [x] Endpoint de disponibilidad con discretización de slots
- [x] Conversión de zonas horarias para pacientes
- [x] Detección de solapamientos con sesiones existentes
- [x] Sistema de reservas con idempotencia
- [x] Control de concurrencia con locks por terapeuta
- [x] Validación de disponibilidad y ventanas
- [x] Documentación Swagger modularizada
- [x] Gestión de sesiones (obtener y cancelar)
- [x] Jobs periódicos para cancelación automática
- [x] Cálculo de disponibilidad en listado de terapeutas
- [x] Ordenamiento por escasez de slots disponibles

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autor

- **Lucas Della Sala** - [@lucasdellasala](https://github.com/lucasdellasala)
