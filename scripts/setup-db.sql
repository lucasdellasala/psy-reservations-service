-- Script para configurar la base de datos PostgreSQL
-- Ejecutar como usuario postgres o con permisos de superusuario

-- Crear la base de datos
CREATE DATABASE psy_reservations;

-- Crear usuario (opcional, si quieres un usuario específico)
-- CREATE USER psy_user WITH PASSWORD 'your_password';

-- Dar permisos al usuario (si creaste uno específico)
-- GRANT ALL PRIVILEGES ON DATABASE psy_reservations TO psy_user;

-- Conectar a la base de datos
\c psy_reservations;

-- Verificar que estamos en la base de datos correcta
SELECT current_database(); 