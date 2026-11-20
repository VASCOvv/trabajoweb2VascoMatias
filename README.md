# 🎮 GameHub IPVG – Torneos de videojuegos y eSports

Plataforma web para organizar y administrar torneos internos de videojuegos y eSports del
**Instituto Profesional Virginio Gómez (sede Chillán)**.

- **Repositorio:** https://github.com/VASCOvv/trabajoweb2VascoMatias
- **Tablero Kanban:** https://github.com/users/VASCOvv/projects/1

## 1. Problema

Las inscripciones, equipos, enfrentamientos y resultados de los torneos se coordinaban de manera informal, lo que dificultaba
controlar cupos, evitar inscripciones duplicadas, registrar resultados oficiales y mantener un ranking actualizado.
GameHub IPVG centraliza todo el proceso: registro de estudiantes, formación de equipos, inscripción a torneos, calendario de
partidos, registro de resultados oficiales y ranking calculado automáticamente.

## 2. Integrantes

| Integrante | Usuario GitHub | Rama |
|---|---|---|
| Vasco Zambrano | VASCOvv | `rama-vasco` |
| Matías | AedoMatias | `rama-matias` |

## 3. Funcionalidades principales

- Registro e inicio de sesión con correo y contraseña (token JWT).
- Roles **Administrador** y **Estudiante** con permisos distintos.
- Perfil del usuario autenticado (nombre, alias y contraseña).
- Creación y administración de equipos, con capitán e integrantes.
- CRUD de torneos (solo Administrador), con búsqueda por texto y filtros combinables (videojuego, estado, modalidad y fecha).
- Inscripción de equipos en torneos con control de duplicados, cupo máximo y fecha de cierre.
- Aceptación o rechazo de inscripciones por el Administrador.
- Programación de partidos entre equipos inscritos y registro de resultados oficiales.
- Tabla de posiciones calculada automáticamente a partir de los resultados.
- Rutas dinámicas de detalle (`/torneos/:id`, `/equipos/:id`, `/partidos/:id`), mensajes de carga, éxito, error y estado vacío,
  y confirmación antes de eliminar.

## 4. Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Vue 3 + Vite, Vue Router 4, `fetch()` |
| Backend | NestJS 11, class-validator, JWT (`@nestjs/jwt`), bcryptjs |
| Base de datos | MySQL 8 (probado con MariaDB de XAMPP) + TypeORM |
| Documentación API | Swagger (`@nestjs/swagger`) |
| Pruebas | Jest (backend) + pruebas manuales documentadas |
| Gestión | Git, GitHub (ramas + Pull Requests), Kanban en GitHub Projects |

## 5. Arquitectura

```
┌──────────────────────┐    HTTP + JSON     ┌─────────────────────────┐   TypeORM   ┌──────────┐
│  Vue 3 (SPA, Vite)   │ ─────────────────▶ │  NestJS API REST        │ ──────────▶ │  MySQL   │
│  :5173               │  Authorization:    │  :3000  (/docs Swagger) │             │  :3306   │
│  views / components  │  Bearer <JWT>      │  módulos por recurso    │             │          │
└──────────────────────┘ ◀───────────────── └─────────────────────────┘ ◀────────── └──────────┘
```

### Estructura de carpetas

```
backend/
  src/
    auth/            registro y login (emite JWT)
    usuarios/        perfil y administración de usuarios
    equipos/         equipos, capitán e integrantes
    torneos/         CRUD de torneos + ranking (ranking.ts)
    inscripciones/   reglas de inscripción (duplicado, cupo, cierre)
    partidos/        programación de partidos
    resultados/      resultados oficiales
    common/          enums, decoradores (@Public, @Roles, @UsuarioActual) y guards
    database/        configuración TypeORM y seed (datos de prueba)
  database/          scripts SQL (crear BD y consultas de verificación)
frontend/
  src/
    views/           una vista por pantalla
    components/      componentes reutilizables
    router/          rutas + protección de navegación
    services/        api.js (fetch), auth.js (sesión), formato.js
docs/                pruebas manuales, Kanban y bitácora
```

Cada módulo de NestJS tiene **entity**, **DTO**, **controller** (endpoints) y **service** (lógica de negocio + Repository de TypeORM).

## 6. Modelo de datos

```
Usuario 1───N Equipo (capitanId)
Usuario N───N Equipo (tabla equipo_integrantes)
Equipo  1───N Inscripcion N───1 Torneo        (Equipo ↔ Torneo mediante Inscripcion)
Torneo  1───N Partido   1───0..1 Resultado
Partido N───1 Equipo (equipoLocalId) / N───1 Equipo (equipoVisitanteId)
Resultado N───1 Equipo (ganadorId, null = empate) / N───1 Usuario (registradoPor)
```

| Entidad | Campos |
|---|---|
| Usuario | id, nombre, alias, correo, password (hash bcrypt), rol, activo, creadoEn |
| Equipo | id, nombre, capitanId, juegoPreferido, estado, creadoEn |
| Torneo | id, nombre, videojuego, modalidad, descripcion, fechaInicio, cierreInscripcion, cupoMaximo, estado |
| Inscripcion | id, torneoId, equipoId, fecha, estado — **UNIQUE(torneoId, equipoId)** |
| Partido | id, torneoId, equipoLocalId, equipoVisitanteId, fechaHora, ronda, estado |
| Resultado | id, partidoId (**UNIQUE**), puntajeLocal, puntajeVisitante, ganadorId, registradoPor, fechaRegistro |

**Decisiones de diseño:**
- `modalidad`: `LIGA` (permite empate) o `ELIMINACION` (no permite empate).
- El ranking **no se guarda** en la base de datos: se calcula en cada consulta a partir de los resultados oficiales
  (`backend/src/torneos/ranking.ts`). Así es imposible ingresar puntos manualmente. Victoria = 3, empate = 1, derrota = 0.
- El cupo cuenta inscripciones `PENDIENTE` + `ACEPTADA` (las rechazadas liberan cupo).

## 7. Roles y permisos

| Acción | Invitado | Estudiante | Administrador |
|---|:-:|:-:|:-:|
| Ver torneos, equipos, partidos, ranking | ✅ | ✅ | ✅ |
| Registrarse / iniciar sesión | ✅ | – | – |
| Editar su perfil | – | ✅ | ✅ |
| Crear equipo (queda como capitán) | – | ✅ | ✅ |
| Editar/eliminar equipo, agregar/quitar integrantes | – | solo capitán | ✅ |
| Inscribir equipo en torneo | – | solo capitán | ✅ |
| Aceptar / rechazar inscripciones | – | – | ✅ |
| Crear / editar / eliminar torneos | – | – | ✅ |
| Programar partidos | – | – | ✅ |
| Registrar resultados oficiales | – | – | ✅ |

Implementación: `AuthGuard` global verifica el JWT (salvo endpoints con `@Public()`) y `RolesGuard` global revisa `@Roles(Rol.ADMIN)`.
En el frontend, el router protege rutas con `meta.requiereAuth` / `meta.rol` y los botones se muestran según el rol.

## 8. Reglas de negocio implementadas

| Regla | Dónde |
|---|---|
| Un equipo no puede inscribirse dos veces en el mismo torneo | `InscripcionesService.create` + índice UNIQUE en BD |
| No superar el cupo máximo | `InscripcionesService.create` y `cambiarEstado` |
| No aceptar inscripciones con período cerrado | `inscripcionCerrada()` + estado `ABIERTO` |
| Partido entre dos equipos distintos, inscritos (aceptados) en el mismo torneo | `PartidosService.validarEquipos` |
| Resultado solo para partido existente, uno por partido, ganador o empate según modalidad | `ResultadosService.create` + `determinarGanador()` |
| Ranking calculado desde resultados oficiales | `calcularRanking()` |
| Operaciones protegidas requieren token; acciones de admin restringidas | `AuthGuard` + `RolesGuard` |
| Recurso inexistente → 404 y mensaje en el frontend | `NotFoundException` + vistas de detalle |

## 9. Instalación y ejecución

**Requisitos:** Node.js 20+ y npm, MySQL 8 (o XAMPP), Git.

### 9.1 Clonar el repositorio

```bash
git clone https://github.com/VASCOvv/trabajoweb2VascoMatias.git
cd trabajoweb2VascoMatias
```

### 9.2 Base de datos (MySQL)

Con MySQL encendido, ejecutar `backend/database/crear_bd.sql` (por ejemplo en MySQL Workbench o phpMyAdmin):

```sql
CREATE DATABASE IF NOT EXISTS gamehub_ipvg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas las crea TypeORM. Con **XAMPP** (MariaDB, compatible con MySQL): iniciar MySQL desde el panel de XAMPP;
por defecto usa el puerto `3306`, usuario `root` y contraseña vacía (`DB_PASSWORD=`). El proyecto fue probado así.

### 9.3 Backend (terminal 1)

```bash
cd backend
npm install
cp .env.example .env      # en Windows CMD: copy .env.example .env  → completar DB_PASSWORD y JWT_SECRET
npm run seed              # crea tablas y carga datos de prueba (BORRA los datos existentes)
npm run start:dev         # http://localhost:3000
```

### 9.4 Frontend (terminal 2)

```bash
cd frontend
npm install
cp .env.example .env      # en Windows CMD: copy .env.example .env
npm run dev               # http://localhost:5173
```

### 9.5 Usuarios de prueba (creados por el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@ipvg.cl | admin123 |
| Estudiantes | estudiante1@ipvg.cl … estudiante8@ipvg.cl | clave123 |

El seed crea 3 torneos (uno en curso con ranking, uno con inscripciones abiertas y uno futuro), 6 equipos, inscripciones,
6 partidos y 4 resultados.

## 10. Variables de entorno

`backend/.env.example`:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (3000) |
| `FRONTEND_URL` | Origen permitido por CORS (http://localhost:5173) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión MySQL |
| `DB_SYNC` | `true` en desarrollo: TypeORM sincroniza las tablas |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y duración del token |

`frontend/.env.example`: `VITE_API_URL=http://localhost:3000`.

Los archivos `.env` están en `.gitignore` y **no se publican**, porque contienen contraseñas y claves privadas.

## 11. Principales endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | – | Registro de estudiante |
| POST | `/auth/login` | – | Login, devuelve `access_token` |
| GET / PATCH | `/usuarios/me` | 🔒 | Ver / editar perfil |
| GET | `/usuarios` | 🔒 | Listar usuarios |
| PATCH | `/usuarios/:id` | 🔒 ADMIN | Cambiar rol / activo |
| GET | `/torneos?q=&videojuego=&estado=&modalidad=&desde=` | – | Listar con búsqueda y filtros |
| GET | `/torneos/:id` | – | Detalle con inscripciones |
| GET | `/torneos/:id/ranking` | – | Tabla de posiciones calculada |
| POST / PATCH / DELETE | `/torneos[/:id]` | 🔒 ADMIN | CRUD de torneos |
| GET | `/equipos?q=&juego=&estado=` | – | Listar equipos |
| GET | `/equipos/:id` | – | Detalle |
| POST / PATCH / DELETE | `/equipos[/:id]` | 🔒 capitán/ADMIN | Gestionar equipos |
| POST / DELETE | `/equipos/:id/integrantes[/:usuarioId]` | 🔒 capitán/ADMIN | Integrantes |
| GET | `/inscripciones?torneoId=&equipoId=` | – | Listar |
| POST | `/inscripciones` | 🔒 capitán/ADMIN | Inscribir equipo |
| PATCH | `/inscripciones/:id/estado` | 🔒 ADMIN | Aceptar / rechazar |
| DELETE | `/inscripciones/:id` | 🔒 capitán/ADMIN | Anular |
| GET | `/partidos?torneoId=&equipoId=&estado=` | – | Calendario |
| GET | `/partidos/:id` | – | Detalle con resultado |
| POST / PATCH / DELETE | `/partidos[/:id]` | 🔒 ADMIN | Programar / reprogramar / cancelar |
| GET | `/resultados[/:id]` | – | Resultados |
| POST / PATCH / DELETE | `/resultados[/:id]` | 🔒 ADMIN | Registrar / corregir / anular resultado |

## 12. Swagger

Con la API encendida: **http://localhost:3000/docs**

1. Ejecutar `POST /auth/login` con `{"correo":"admin@ipvg.cl","password":"admin123"}`.
2. Copiar el `access_token` de la respuesta.
3. Presionar **Authorize** (arriba a la derecha) y pegar el token.
4. Los endpoints con candado 🔒 requieren autenticación; los demás son públicos.

## 13. Pruebas

### Automáticas (Jest)

```bash
cd backend
npm test
```

| Archivo | Qué verifica |
|---|---|
| `src/torneos/ranking.spec.ts` | Puntos por victoria/empate/derrota, ignorar partidos sin resultado, orden por puntos y diferencia |
| `src/inscripciones/inscripciones.service.spec.ts` | Inscripción válida, duplicada (409), cupo máximo, período cerrado, solo el capitán inscribe |
| `src/resultados/resultados.service.spec.ts` | Ganador local/visitante/empate, empate prohibido en eliminación, partido inexistente (404), resultado duplicado (409), partido pasa a FINALIZADO |

Resultado: **3 suites, 17 pruebas, todas aprobadas.**

### Manuales

- [`docs/PRUEBAS_MANUALES.md`](docs/PRUEBAS_MANUALES.md): 30 casos de prueba funcionales (login, roles, validaciones, filtros,
  ID inexistente, reglas de negocio, persistencia y error de conexión). El resultado de cada caso se registra en la columna **Obtenido**.
- [`backend/database/consultas_verificacion.sql`](backend/database/consultas_verificacion.sql): consultas SQL para comprobar los datos.

## 14. Metodología Kanban y trabajo en GitHub

- **Tablero:** https://github.com/users/VASCOvv/projects/1 con columnas **Pendiente → En proceso → Terminado**.
  Cada tarea es un issue con responsable; el commit que la completa la cierra con `Closes #n`.
- **Flujo Git:** `main` (versión estable) ← Pull Request ← `rama-vasco` / `rama-matias`. Nadie trabaja directo en `main`:
  cada integración pasa por un Pull Request revisado por el otro integrante.
- Detalle de tareas y bitácora en [`docs/KANBAN_Y_BITACORA.md`](docs/KANBAN_Y_BITACORA.md).

## 15. Aportes de cada integrante

| Integrante | Backend | Frontend | Tareas |
|---|---|---|---|
| Vasco | Configuración NestJS + MySQL, entidades, auth JWT, roles y guards, partidos, resultados y seed | Frontend base, login, registro, perfil, inicio y vistas de equipos | #1, #2, #4, #5, #8 |
| Matías | Equipos, torneos + ranking, inscripciones y reglas de negocio | Vistas de torneos y de partidos, documentación de pruebas | #3, #6, #7, #9, #10 |

## 16. Problemas encontrados y soluciones

| Problema | Solución |
|---|---|
| La contraseña se devolvía en las respuestas de la API | `select: false` en la columna y `addSelect` solo en el login |
| Las fechas `DATE` se mostraban un día antes en el navegador | Se interpreta `YYYY-MM-DD` como fecha local en `formato.js` |
| El ranking podía quedar desactualizado si se guardaba en una tabla | Se calcula en cada consulta desde los resultados oficiales |
| El MySQL instalado en el equipo tenía una contraseña desconocida | Se usó el MySQL (MariaDB) de XAMPP, puerto 3306, usuario `root` sin contraseña |
| El backend no iniciaba con el error `EADDRINUSE` (puerto 3000 ocupado) | Había otra instancia de la API corriendo; se cerró antes de volver a iniciar |
| `ECONNREFUSED` al iniciar el backend | MySQL estaba apagado; se inicia primero MySQL y luego la API |
| `app.module.ts` y el router se modificaban en varias tareas a la vez | Cada integrante trajo los cambios de `main` a su rama (`git merge origin/main`) antes de cada commit |
| Un cambio en el README eliminó secciones obligatorias | Se restauró la versión completa y se integraron los aportes nuevos (funcionalidades e instalación en Windows) |

## 17. Declaración de uso de Inteligencia Artificial

| Herramienta | Uso | Parte afectada | Revisión realizada por el equipo |
|---|---|---|---|
| Claude (Anthropic) | Generación de código base del backend y del frontend | Módulos NestJS (`auth`, `usuarios`, `equipos`, `torneos`, `inscripciones`, `partidos`, `resultados`, `common`), vistas y componentes Vue, `api.js`, router y seed | Se separó el código por tareas y en cada commit se verificó que compilara de forma independiente; se ejecutó la aplicación y se probaron login, roles, filtros, inscripciones y registro de resultados |
| Claude (Anthropic) | Pruebas automáticas | `*.spec.ts` | Se ejecutaron con `npm test` (17 pruebas aprobadas) y se revisaron los casos que cubren las reglas de negocio |
| Claude (Anthropic) | Documentación y organización del trabajo | README, `docs/`, tareas del Kanban y mensajes de commit/PR | Se revisó que la documentación coincidiera con el código y con los requisitos del enunciado |
| Claude (Anthropic) | Explicación del código y depuración | Errores de conexión a MySQL, puertos y conflictos de ramas | Se aplicaron y comprobaron las soluciones en el equipo de cada integrante |

> Todo el código entregado es responsabilidad del equipo y cada integrante puede explicar el sistema completo.
