-- Consultas SQL de verificacion de GameHub IPVG
USE gamehub_ipvg;

-- Usuarios y roles
SELECT id, nombre, alias, correo, rol, activo FROM usuarios;

-- Equipos con su capitan y cantidad de integrantes
SELECT e.id, e.nombre, e.juegoPreferido, u.alias AS capitan, COUNT(ei.usuarioId) AS integrantes
FROM equipos e
JOIN usuarios u ON u.id = e.capitanId
LEFT JOIN equipo_integrantes ei ON ei.equipoId = e.id
GROUP BY e.id, e.nombre, e.juegoPreferido, u.alias;

-- Torneos con cupo usado (inscripciones no rechazadas)
SELECT t.id, t.nombre, t.estado, t.cupoMaximo,
       SUM(i.estado <> 'RECHAZADA') AS cupoUsado
FROM torneos t
LEFT JOIN inscripciones i ON i.torneoId = t.id
GROUP BY t.id, t.nombre, t.estado, t.cupoMaximo;

-- Verificar que no existan inscripciones duplicadas (debe devolver 0 filas)
SELECT torneoId, equipoId, COUNT(*) c FROM inscripciones GROUP BY torneoId, equipoId HAVING c > 1;

-- Partidos con su resultado
SELECT p.id, t.nombre AS torneo, p.ronda, el.nombre AS local, ev.nombre AS visitante,
       r.puntajeLocal, r.puntajeVisitante, g.nombre AS ganador, p.estado
FROM partidos p
JOIN torneos t ON t.id = p.torneoId
JOIN equipos el ON el.id = p.equipoLocalId
JOIN equipos ev ON ev.id = p.equipoVisitanteId
LEFT JOIN resultados r ON r.partidoId = p.id
LEFT JOIN equipos g ON g.id = r.ganadorId
ORDER BY p.fechaHora;

-- Verificar que ningun partido enfrente al mismo equipo (debe devolver 0 filas)
SELECT * FROM partidos WHERE equipoLocalId = equipoVisitanteId;
