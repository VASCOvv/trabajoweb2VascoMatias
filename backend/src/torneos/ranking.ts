/**
 * Cálculo de la tabla de posiciones.
 * Es una función pura (no usa la base de datos) para poder probarla
 * fácilmente con pruebas automáticas.
 *
 * Sistema de puntos: victoria = 3, empate = 1, derrota = 0.
 * Orden: puntos, diferencia, puntos/goles a favor y finalmente nombre.
 * Solo se consideran partidos que tienen un resultado oficial.
 */

export const PUNTOS_VICTORIA = 3;
export const PUNTOS_EMPATE = 1;

export interface EquipoRanking {
  id: number;
  nombre: string;
}

export interface PartidoRanking {
  equipoLocalId: number;
  equipoVisitanteId: number;
  resultado?: { puntajeLocal: number; puntajeVisitante: number } | null;
}

export interface FilaRanking {
  posicion: number;
  equipoId: number;
  equipo: string;
  jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  aFavor: number;
  enContra: number;
  diferencia: number;
  puntos: number;
}

export function calcularRanking(equipos: EquipoRanking[], partidos: PartidoRanking[]): FilaRanking[] {
  const tabla = new Map<number, FilaRanking>();
  for (const e of equipos) {
    tabla.set(e.id, {
      posicion: 0,
      equipoId: e.id,
      equipo: e.nombre,
      jugados: 0,
      victorias: 0,
      empates: 0,
      derrotas: 0,
      aFavor: 0,
      enContra: 0,
      diferencia: 0,
      puntos: 0,
    });
  }

  for (const p of partidos) {
    if (!p.resultado) continue; // sin resultado oficial no suma
    const local = tabla.get(p.equipoLocalId);
    const visita = tabla.get(p.equipoVisitanteId);
    if (!local || !visita) continue;

    const { puntajeLocal: pl, puntajeVisitante: pv } = p.resultado;
    local.jugados++;
    visita.jugados++;
    local.aFavor += pl;
    local.enContra += pv;
    visita.aFavor += pv;
    visita.enContra += pl;

    if (pl > pv) {
      local.victorias++;
      visita.derrotas++;
    } else if (pv > pl) {
      visita.victorias++;
      local.derrotas++;
    } else {
      local.empates++;
      visita.empates++;
    }
  }

  const filas = [...tabla.values()].map((f) => ({
    ...f,
    diferencia: f.aFavor - f.enContra,
    puntos: f.victorias * PUNTOS_VICTORIA + f.empates * PUNTOS_EMPATE,
  }));

  filas.sort(
    (a, b) =>
      b.puntos - a.puntos ||
      b.diferencia - a.diferencia ||
      b.aFavor - a.aFavor ||
      a.equipo.localeCompare(b.equipo),
  );
  filas.forEach((f, i) => (f.posicion = i + 1));
  return filas;
}
