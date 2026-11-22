# Kanban y bitácora – GameHub IPVG

## Tablero

Herramienta: GitHub Projects (vista Board) – https://github.com/users/VASCOvv/projects/1
Columnas: **Pendiente → En proceso → Terminado**. Cada tarjeta es un issue del repositorio, tiene responsable (Assignee)
y se cierra con el commit/Pull Request que lo menciona (`Closes #n`).

## Tareas y distribución

Cada integrante toma módulos completos y trabaja tanto en backend como en frontend.

| Issue | Tarea | Responsable | Tipo |
|---|---|---|---|
| #1 | Configuración inicial NestJS + MySQL + modelo de datos | Vasco | Backend |
| #2 | Login y registro con JWT, roles y guards | Vasco | Backend |
| #3 | Módulo equipos con capitán e integrantes | Matías | Backend |
| #4 | Frontend base: router, login, registro y perfil | Vasco | Frontend |
| #6 | Torneos: CRUD y ranking calculado | Matías | Backend |
| #5 | Vistas de inicio y equipos con búsqueda y filtros | Vasco | Frontend |
| #7 | Inscripciones: duplicado, cupo y cierre | Matías | Backend |
| #8 | Partidos y resultados oficiales + datos de prueba | Vasco | Backend |
| #9 | Vistas de torneos: listado, filtros, detalle y formulario | Matías | Frontend |
| #10 | Vistas de partidos + documentación de pruebas y README | Matías | Frontend |

## Bitácora

| Fecha | Integrante | Avance / problema / decisión |
|---|---|---|
| 2026-11-16 | Vasco | Lectura del enunciado, definición del modelo de datos, creación del tablero y de las tareas |
| 2026-11-16 | Vasco | Commit de configuración inicial y entidades (#1) |
| 2026-11-18 | Vasco | Commit de autenticación JWT, roles y guards (#2) |
| 2026-11-19 | Vasco | PR #11: integración de #1 y #2 a `main` |
| 2026-11-19 | Matías | Módulo de equipos (#3), PR #12 |
| 2026-11-19 | Vasco | Frontend base en Vue (#4), PR #13; vistas de equipos (#5), PR #14 |
| 2026-11-19 | Matías | Torneos + ranking (#6), PR #15, y inscripciones (#7), PR #16, ambos revisados y aprobados por Vasco |
| 2026-11-19 | Vasco | Partidos, resultados y seed (#8), PR #17, integrado por Matías |
| 2026-11-20 | Matías | Vistas de torneos (#9), PR #18, y vistas de partidos + documentación (#10), PR #19, aprobados por Vasco |
| 2026-11-20 | Vasco | Problema: el README de #10 había perdido secciones obligatorias; se restauró y completó (PR #20) |
| 2026-11-22 | Vasco | Revisión final: clon limpio, instalación, build, 17 pruebas automáticas y 30 pruebas manuales aprobadas |
