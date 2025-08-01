# 🚀 Deploy en Fly.io

Este proyecto está configurado para ser deployado en Fly.io sin usar Docker Compose.

## 📋 Prerrequisitos

1. **Instalar Fly CLI**:

   ```bash
   # macOS
   brew install flyctl

   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Autenticarse con Fly**:
   ```bash
   fly auth login
   ```

## 🛠️ Configuración

### 1. Variables de Entorno

Antes del deploy, configurar las variables de entorno:

```bash
# Configurar variables de entorno
fly secrets set DATABASE_URL="postgresql://user:password@host:5432/database"
fly secrets set NODE_ENV="production"
fly secrets set TZ="UTC"

# Configurar CORS si es necesario
fly secrets set CORS_ORIGIN_1="https://tu-frontend.com"
fly secrets set CORS_ORIGIN_2="https://staging.tu-frontend.com"
```

### 2. Base de Datos

Para usar PostgreSQL en Fly.io:

```bash
# Crear base de datos PostgreSQL
fly postgres create --name psy-reservations-db --region mad

# Conectar la app a la base de datos
fly postgres attach --postgres-app psy-reservations-db --app psy-reservations-service
```

## 🚀 Deploy

### Deploy Inicial

```bash
# En el directorio del proyecto
fly launch
```

Durante el proceso:

- Confirmar el nombre de la app: `psy-reservations-service`
- Seleccionar región: `mad` (Madrid)
- No crear base de datos (ya configurada)
- No deployar ahora

### Deploy Manual

```bash
# Preparar el proyecto (opcional)
chmod +x prepare-deploy.sh
./prepare-deploy.sh

# Deployar la aplicación
fly deploy
```

### Verificar Deploy

```bash
# Ver logs
fly logs

# Verificar estado
fly status

# Abrir la aplicación
fly open
```

## 🔧 Configuración del Proyecto

### Archivos Creados

- `fly.toml` - Configuración de Fly.io
- `Dockerfile.prod` - Imagen Docker optimizada para producción
- `Dockerfile.simple` - Imagen Docker simple (alternativa)
- `Dockerfile` - Imagen Docker multi-stage (alternativa)
- `.dockerignore` - Archivos excluidos del build
- `DEPLOY.md` - Esta documentación

### Configuración Incluida

- **App name**: `psy-reservations-service`
- **Puerto**: 3000
- **Healthcheck**: `/health`
- **Región**: Madrid (`mad`)
- **Imagen base**: Node 20 Alpine
- **Script de inicio**: `npm run start:prod`

## 📊 Monitoreo

### Logs

```bash
# Ver logs en tiempo real
fly logs --follow

# Ver logs de una máquina específica
fly logs --instance <instance-id>
```

### Métricas

```bash
# Ver métricas de la aplicación
fly status

# Ver información detallada
fly info
```

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# Deployar cambios
fly deploy

# Verificar el deploy
fly status
```

## 🚨 Solución de Problemas

### Error de Dependencias

Si hay conflictos de dependencias durante el build:

```bash
# Actualizar dependencias localmente
npm install @nestjs/config@^4.0.0 --legacy-peer-deps
npm install --legacy-peer-deps

# O usar el script incluido
chmod +x update-deps.sh
./update-deps.sh

# Preparar proyecto completo
chmod +x prepare-deploy.sh
./prepare-deploy.sh
```

### Verificar Healthcheck

```bash
# Probar el endpoint de health
curl https://psy-reservations-service.fly.dev/health
```

### Verificar Variables de Entorno

```bash
# Listar secrets
fly secrets list

# Ver logs para debug
fly logs --follow
```

### Error de Máquina Bloqueada

Si hay errores de lease o rate limit:

```bash
# Destruir máquinas existentes
fly machines destroy 6e82996dbdee18

# O destruir todas las máquinas
fly machines destroy --all

# Esperar unos minutos y reintentar
fly deploy
```

### Rebuild Manual

```bash
# Forzar rebuild
fly deploy --force
```

## 📚 Recursos

- [Fly.io Documentation](https://fly.io/docs/)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
