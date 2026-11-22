# Pruebas manuales – GameHub IPVG

**Ambiente de ejecución (22/11/2026):** copia limpia del repositorio (`git clone` de `main`), MySQL de XAMPP (MariaDB 10.4, puerto 3306),
backend NestJS en :3000, frontend Vite en :5173 y base cargada con `npm run seed`.

**Forma de verificación:** UI = en el navegador; API = con la petición HTTP equivalente (Swagger / cliente HTTP) revisando el código y
el mensaje de la respuesta.

| # | Caso | Pasos | Resultado esperado | Obtenido |
|---|---|---|---|---|
| 1 | Login correcto | /login con admin@ipvg.cl / admin123 | Redirige al inicio, navbar muestra "admin" + ADMIN | ✅ UI: redirige al inicio con sesión iniciada |
| 2 | Login incorrecto | /login con contraseña errónea | Mensaje "Correo o contraseña incorrectos" (401) | ✅ API: 401 "Correo o contraseña incorrectos" |
| 3 | Validación login | Enviar con correo "abc" | Error bajo el campo, no se llama a la API | ✅ UI: "Ingrese un correo válido" e "Ingrese su contraseña" |
| 4 | Registro inválido | /registro con datos inválidos | Errores bajo cada campo | ✅ API: 400 con un mensaje por campo (nombre, alias, correo, contraseña) |
| 5 | Ruta protegida sin sesión | Ir a /perfil sin login | Redirige a /login?redirect=/perfil | ✅ UI: redirige a /login?redirect=/perfil |
| 6 | Ruta de admin como estudiante | Login estudiante1 e ir a /torneos/nuevo | Vuelve al inicio con aviso "No tiene permisos" | ✅ UI: vuelve al inicio con el aviso |
| 7 | API protegida por rol | `POST /torneos` con token de estudiante | 403 Forbidden | ✅ API: 403 "No tiene permisos para realizar esta acción" |
| 8 | API sin token | `POST /torneos` sin token | 401 Unauthorized | ✅ API: 401 "Debe iniciar sesión para realizar esta acción" |
| 9 | Crear torneo | Admin crea un torneo | Se guarda y aparece en la lista | ✅ API: 201 |
| 10 | Validación torneo | Cupo 1 / fechas inválidas | Error de validación | ✅ API: 400 "El cupo mínimo es 2 equipos" |
| 11 | Editar torneo | Admin cambia el nombre | Se actualiza | ✅ API: 200 |
| 12 | Eliminar torneo | Admin elimina el torneo creado | Se elimina (en la UI pide confirmación) | ✅ API: 200 |
| 13 | Crear equipo | Estudiante crea un equipo | Queda como capitán e integrante | ✅ API: 201, capitán = usuario autenticado |
| 14 | Agregar / quitar integrante | Capitán agrega y quita un integrante | La lista se actualiza | ✅ API: 2 integrantes al agregar, 1 al quitar |
| 15 | Inscribir equipo | Capitán inscribe su equipo en la Copa Rocket League | Inscripción PENDIENTE | ✅ API: 201 |
| 16 | Inscripción duplicada | Repetir la misma inscripción | 409 "El equipo ya está inscrito en este torneo" | ✅ API: 409 con ese mensaje |
| 17 | Cupo máximo | Copa Rocket League (cupo 4): inscribir un 5.º equipo | "alcanzó su cupo máximo" | ✅ API: 400 "El torneo alcanzó su cupo máximo de 4 equipos" |
| 18 | Inscripción cerrada | Inscribir en "Liga Valorant" (cierre pasado) | 400 "período de inscripción… cerrado" | ✅ API: 400 "El período de inscripción de este torneo está cerrado" |
| 19 | Aceptar / rechazar | Admin acepta "Turbo Kickers" | Estado ACEPTADA | ✅ API: 200 |
| 20 | Programar partido | Mismo equipo local y visitante | Error "dos equipos distintos" | ✅ API: 400 "Un partido debe enfrentar a dos equipos distintos" |
| 21 | Partido con equipo no aceptado | `POST /partidos` con equipo PENDIENTE | 400 "Ambos equipos deben tener una inscripción ACEPTADA" | ✅ API: 400 con ese mensaje |
| 22 | Registrar resultado | Admin registra 13 a 5 en un partido programado de la Liga | Partido FINALIZADO y ranking actualizado | ✅ API: 201 y el ranking suma los puntos |
| 23 | Empate en eliminación | Partido de la Copa → 2 a 2 | Error "no se permiten empates" | ✅ API: 400 "En modalidad ELIMINACION no se permiten empates" |
| 24 | Resultado duplicado | `POST /resultados` sobre partido finalizado | 409 | ✅ API: 409 |
| 25 | Búsqueda y filtros | Buscar "copa" + estado + modalidad | Lista filtrada combinando criterios | ✅ API y UI: 1 resultado (Copa Rocket League) |
| 26 | ID inexistente | /torneos/9999 y /partidos/9999 | 404 y mensaje "Torneo con id 9999 no existe" | ✅ API 404 y UI muestra el mensaje |
| 27 | Ruta inexistente | Ir a /cualquier-cosa | Página 404 | ✅ UI: "404 · Página no encontrada" |
| 28 | Persistencia | Crear un equipo, detener la API y volver a iniciarla | El equipo sigue existiendo | ✅ "Equipo Prueba" sigue existiendo tras reiniciar la API |
| 29 | Error de comunicación | Detener la API y recargar /torneos | "No se pudo conectar con el servidor…" + botón Reintentar | ✅ UI: muestra el mensaje y el botón Reintentar |
| 30 | Datos extra rechazados | `POST /auth/register` con campo `rol: "ADMIN"` | 400 "property rol should not exist" | ✅ API: 400 "property rol should not exist" |

**Resultado:** 30 de 30 casos con el resultado esperado.

**Pruebas automáticas** (`cd backend && npm test`): 3 suites, 17 pruebas aprobadas.
