#!/bin/bash

echo "🔄 Actualizando dependencias..."

# Actualizar @nestjs/config a versión compatible
npm install @nestjs/config@^4.0.0 --legacy-peer-deps

# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
npm install --legacy-peer-deps

echo "✅ Dependencias actualizadas correctamente" 