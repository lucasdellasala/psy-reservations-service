#!/bin/bash

echo "🚀 Preparando proyecto para deploy..."

# Limpiar archivos de build
echo "🧹 Limpiando archivos de build..."
rm -rf dist/
rm -rf node_modules/

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# Generar Prisma client
echo "🔧 Generando Prisma client..."
npx prisma generate

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build

echo "✅ Proyecto listo para deploy!"
echo "💡 Ejecuta: fly deploy" 