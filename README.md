# GameHub IPVG – Torneos de videojuegos y eSports

Plataforma web para organizar y administrar torneos internos de videojuegos y eSports del Instituto Profesional Virginio Gómez, sede Chillán.

## Tecnologías utilizadas

**Frontend**
- Vue 3
- Vite
- Vue Router
- JavaScript

**Backend**
- NestJS
- TypeORM
- JWT para autenticación

**Base de datos**
- MySQL

**Control de versiones**
- Git y GitHub
- GitHub Projects (Kanban)

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Control de acceso según roles.
- Creación y administración de equipos.
- Gestión de integrantes y capitanes.
- Creación, edición, consulta y eliminación de torneos.
- Búsqueda y filtros de torneos.
- Inscripción de equipos en torneos.
- Validación de cupos y fechas de inscripción.
- Administración de partidos.
- Registro de resultados oficiales.
- Consulta de rankings de torneos.

## Requisitos

Para ejecutar el proyecto se necesita:

- Node.js y npm.
- MySQL.
- Git.
- Un editor de código, como Visual Studio Code.

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/VASCOvv/trabajoweb2VascoMatias.git
cd trabajoweb2VascoMatias
```

### 2. Preparar la base de datos

Iniciar MySQL y ejecutar el archivo:

`backend/database/crear_bd.sql`

Este script crea la base de datos `gamehub_ipvg`.

### 3. Configurar las variables de entorno

Dentro de la carpeta `backend`, copiar el archivo `.env.example` y crear un archivo llamado `.env`.

En Windows CMD se puede realizar con:

```cmd
cd backend
copy .env.example .env
```

Editar el nuevo archivo `.env` con los datos de conexión a MySQL y configurar un secreto JWT adecuado.

**Importante:** No subir el archivo `.env` a GitHub porque puede contener contraseñas y claves privadas.

### 4. Ejecutar el backend

Desde la carpeta `backend`:

```cmd
npm install
npm run start:dev
```

El backend se ejecuta normalmente en `http://localhost:3000`.

### 5. Ejecutar el frontend

En otra terminal, desde la carpeta `frontend`:

```cmd
npm install
npm run dev
```

El frontend se ejecuta normalmente en `http://localhost:5173`.

### 6. Cargar datos de prueba

Desde la carpeta `backend`:

```cmd
npm run seed
```

Este comando permite cargar datos de prueba para verificar las funcionalidades del sistema. Se debe ejecutar con la conexión a MySQL correctamente configurada.
### 3. Ejecutar el backend

Desde la carpeta principal:

```bash
cd backend
npm install
npm run start:dev
```

El backend se ejecuta en:

`http://localhost:3000`

### 4. Ejecutar el frontend

Abrir otra terminal y ejecutar:

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecuta normalmente en:

`http://localhost:5173`

### 5. Datos de prueba

El proyecto incluye un mecanismo para cargar datos de prueba mediante:

```bash
cd backend
npm run seed
```

Este comando debe ejecutarse con la base de datos configurada.

## Pruebas y verificación

Los documentos de apoyo se encuentran en:

- `docs/PRUEBAS_MANUALES.md`: casos de prueba funcionales.
- `docs/KANBAN_Y_BITACORA.md`: distribución de tareas y registro de avances.
- `backend/database/consultas_verificacion.sql`: consultas SQL para comprobar los datos.

Los resultados de las pruebas manuales deben registrarse en la columna **Obtenido** del documento correspondiente.

## Organización del trabajo

El proyecto se desarrolló en equipo utilizando ramas independientes:

- `rama-vasco`: desarrollo de las tareas asignadas a Vasco.
- `rama-matias`: desarrollo de las tareas asignadas a Matías.
- `main`: rama principal del proyecto.

Los cambios se integran mediante Pull Requests y se relacionan con los Issues de GitHub.

## Integrantes

| Integrante | Rama |
|---|---|
| Vasco Zambrano (VASCOvv) | `rama-vasco` |
| Matías (AedoMatias) | `rama-matias` |

## Tablero Kanban

https://github.com/users/VASCOvv/projects/1