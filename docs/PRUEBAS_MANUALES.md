# Pruebas manuales – GameHub IPVG

Ambiente: backend `npm run start:dev` (:3000), frontend `npm run dev` (:5173), base cargada con `npm run seed`.
Completar la columna **Obtenido** al ejecutar cada caso (✅ / ❌ + observación) y agregar capturas en `docs/capturas/`.

| # | Caso | Pasos | Resultado esperado | Obtenido |
|---|---|---|---|---|
| 1 | Login correcto | /login con admin@ipvg.cl / admin123 | Redirige al inicio, navbar muestra "admin" + ADMIN | |
| 2 | Login incorrecto | /login con contraseña errónea | Mensaje "Correo o contraseña incorrectos" (401) | |
| 3 | Validación login | Enviar con correo "abc" | Error bajo el campo, no se llama a la API | |
| 4 | Registro inválido | /registro con contraseña de 3 caracteres y confirmación distinta | Errores bajo cada campo | |
| 5 | Ruta protegida sin sesión | Ir a /perfil sin login | Redirige a /login?redirect=/perfil | |
| 6 | Ruta de admin como estudiante | Login estudiante1 e ir a /torneos/nuevo | Vuelve al inicio con aviso "No tiene permisos" | |
| 7 | API protegida por rol | Swagger: `POST /torneos` con token de estudiante | 403 Forbidden | |
| 8 | API sin token | Swagger: `POST /equipos` sin Authorize | 401 Unauthorized | |
| 9 | Crear torneo | Admin → Nuevo torneo → completar y guardar | Aparece en la lista con mensaje de éxito | |
| 10 | Validación torneo | Cierre posterior al inicio / cupo 1 | Error en el formulario | |
| 11 | Editar torneo | Admin → Editar → cambiar nombre | Se actualiza el detalle | |
| 12 | Eliminar torneo | Admin → Eliminar → Cancelar, luego Eliminar → Confirmar | Primero no pasa nada; luego se elimina | |
| 13 | Crear equipo | Estudiante → Equipos → Crear | Queda como capitán e integrante | |
| 14 | Agregar / quitar integrante | Capitán → detalle equipo | Lista se actualiza; quitar pide confirmación | |
| 15 | Inscribir equipo | Capitán de "Rocket Virginio"… (crear equipo nuevo) → Copa Rocket League → Inscribir | Inscripción PENDIENTE | |
| 16 | Inscripción duplicada | Swagger: `POST /inscripciones` repetido | 409 "El equipo ya está inscrito en este torneo" | |
| 17 | Cupo máximo | Copa Rocket League (cupo 4): inscribir 3 equipos más | El 5.º recibe "alcanzó su cupo máximo" | |
| 18 | Inscripción cerrada | Intentar inscribir en "Liga Valorant" (cierre pasado) | 400 "período de inscripción… cerrado" | |
| 19 | Aceptar / rechazar | Admin → Copa → Aceptar "Turbo Kickers" | Estado ACEPTADA | |
| 20 | Programar partido | Admin → Copa → Partidos → mismo equipo local y visitante | Error "Debe ser un equipo distinto" | |
| 21 | Partido con equipo no aceptado | Swagger: `POST /partidos` con equipo PENDIENTE | 400 "Ambos equipos deben tener una inscripción ACEPTADA" | |
| 22 | Registrar resultado | Admin → partido programado de la Liga → 13 a 5 | Partido FINALIZADO y ranking actualizado | |
| 23 | Empate en eliminación | Partido de la Copa → 2 a 2 | Error "no se permiten empates" | |
| 24 | Resultado duplicado | Swagger: `POST /resultados` sobre partido finalizado | 409 | |
| 25 | Búsqueda y filtros | /torneos: escribir "copa" + estado "Inscripciones abiertas" + modalidad | Lista filtrada combinando criterios | |
| 26 | ID inexistente | Ir a /torneos/9999 y /partidos/9999 | Mensaje "Torneo con id 9999 no existe" | |
| 27 | Ruta inexistente | Ir a /cualquier-cosa | Página 404 | |
| 28 | Persistencia | Crear un equipo, detener la API (Ctrl+C) y volver a iniciarla | El equipo sigue existiendo | |
| 29 | Error de comunicación | Detener la API y recargar /torneos | "No se pudo conectar con el servidor…" + botón Reintentar | |
| 30 | Datos extra rechazados | Swagger: `POST /auth/register` con campo `rol: "ADMIN"` | 400 "property rol should not exist" | |
