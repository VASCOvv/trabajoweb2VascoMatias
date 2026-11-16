-- 1) Crear la base de datos del proyecto (ejecutar una sola vez en MySQL Workbench o consola)
CREATE DATABASE IF NOT EXISTS gamehub_ipvg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- (Opcional) usuario propio para la app en vez de root
-- CREATE USER 'gamehub'@'localhost' IDENTIFIED BY 'cambia_esta_clave';
-- GRANT ALL PRIVILEGES ON gamehub_ipvg.* TO 'gamehub'@'localhost';
-- FLUSH PRIVILEGES;

-- 2) Las tablas las crea TypeORM (DB_SYNC=true) o el comando: npm run seed
