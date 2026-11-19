import { calcularRanking } from './ranking';

describe('calcularRanking', () => {
  const equipos = [
    { id: 1, nombre: 'Alfa' },
    { id: 2, nombre: 'Beta' },
    { id: 3, nombre: 'Gamma' },
  ];

  it('asigna 3 puntos por victoria, 1 por empate y 0 por derrota', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 2, resultado: { puntajeLocal: 3, puntajeVisitante: 1 } },
      { equipoLocalId: 1, equipoVisitanteId: 3, resultado: { puntajeLocal: 2, puntajeVisitante: 2 } },
    ]);
    const alfa = tabla.find((f) => f.equipoId === 1);
    const beta = tabla.find((f) => f.equipoId === 2);
    const gamma = tabla.find((f) => f.equipoId === 3);

    expect(alfa).toMatchObject({ jugados: 2, victorias: 1, empates: 1, derrotas: 0, puntos: 4 });
    expect(beta).toMatchObject({ jugados: 1, victorias: 0, derrotas: 1, puntos: 0 });
    expect(gamma).toMatchObject({ jugados: 1, empates: 1, puntos: 1 });
  });

  it('ignora partidos sin resultado oficial', () => {
    const tabla = calcularRanking(equipos, [{ equipoLocalId: 1, equipoVisitanteId: 2, resultado: null }]);
    expect(tabla.every((f) => f.jugados === 0 && f.puntos === 0)).toBe(true);
  });

  it('ordena por puntos y luego por diferencia', () => {
    const tabla = calcularRanking(equipos, [
      { equipoLocalId: 1, equipoVisitanteId: 3, resultado: { puntajeLocal: 1, puntajeVisitante: 0 } },
      { equipoLocalId: 2, equipoVisitanteId: 3, resultado: { puntajeLocal: 5, puntajeVisitante: 0 } },
    ]);
    // Alfa y Beta tienen 3 pts; Beta tiene mejor diferencia (+5 vs +1).
    expect(tabla.map((f) => f.equipo)).toEqual(['Beta', 'Alfa', 'Gamma']);
    expect(tabla[0].posicion).toBe(1);
    expect(tabla[0].diferencia).toBe(5);
  });
});
