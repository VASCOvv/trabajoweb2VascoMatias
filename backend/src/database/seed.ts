/**
 * Datos de prueba.  Ejecutar con:  npm run seed
 * ATENCIÓN: borra y recrea todas las tablas de la base configurada en .env.
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { opcionesBaseDatos } from './data-source';
import { Usuario } from '../usuarios/usuario.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';
import { Resultado } from '../resultados/resultado.entity';
import { EstadoInscripcion, EstadoPartido, EstadoTorneo, Modalidad, Rol } from '../common/enums';
import { determinarGanador } from '../resultados/resultados.service';

function sumarDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const ds = new DataSource({ ...opcionesBaseDatos(), synchronize: true, dropSchema: true });
  await ds.initialize();
  console.log('Tablas recreadas. Insertando datos de prueba...');

  const usuarios = ds.getRepository(Usuario);
  const hash = (p: string) => bcrypt.hash(p, 10);

  const admin = await usuarios.save({
    nombre: 'Administrador GameHub',
    alias: 'admin',
    correo: 'admin@ipvg.cl',
    password: await hash('admin123'),
    rol: Rol.ADMIN,
  });

  const datosEst = [
    ['Camila Rojas', 'camiGG'],
    ['Diego Muñoz', 'dieguito'],
    ['Valentina Soto', 'valeSniper'],
    ['Matías Fuentes', 'mati_fps'],
    ['Javiera Pérez', 'javiCraft'],
    ['Benjamín Torres', 'benjaTT'],
    ['Fernanda Díaz', 'fernyRL'],
    ['Tomás Vergara', 'tomiV'],
  ];
  const est: Usuario[] = [];
  for (let i = 0; i < datosEst.length; i++) {
    const [nombre, alias] = datosEst[i];
    est.push(
      await usuarios.save({
        nombre,
        alias,
        correo: `estudiante${i + 1}@ipvg.cl`,
        password: await hash('clave123'),
        rol: Rol.ESTUDIANTE,
      }),
    );
  }

  const equipos = ds.getRepository(Equipo);
  const eq = await equipos.save([
    { nombre: 'Pumas IPVG', juegoPreferido: 'Valorant', capitan: est[0], integrantes: [est[0], est[1]] },
    { nombre: 'Ñublenses Gaming', juegoPreferido: 'Valorant', capitan: est[2], integrantes: [est[2], est[3]] },
    { nombre: 'Chillán Snipers', juegoPreferido: 'Valorant', capitan: est[4], integrantes: [est[4], est[5]] },
    { nombre: 'Byte Warriors', juegoPreferido: 'Valorant', capitan: est[6], integrantes: [est[6], est[7]] },
    { nombre: 'Rocket Virginio', juegoPreferido: 'Rocket League', capitan: est[1], integrantes: [est[1], est[3]] },
    { nombre: 'Turbo Kickers', juegoPreferido: 'Rocket League', capitan: est[5], integrantes: [est[5], est[7]] },
  ]);

  const torneos = ds.getRepository(Torneo);
  const liga = await torneos.save({
    nombre: 'Liga Valorant IPVG 2026',
    videojuego: 'Valorant',
    modalidad: Modalidad.LIGA,
    descripcion: 'Liga todos contra todos 5v5. Victoria 3 pts, empate 1 pt.',
    fechaInicio: sumarDias(-10),
    cierreInscripcion: sumarDias(-12),
    cupoMaximo: 4,
    estado: EstadoTorneo.EN_CURSO,
  });
  const copa = await torneos.save({
    nombre: 'Copa Rocket League Sede Chillán',
    videojuego: 'Rocket League',
    modalidad: Modalidad.ELIMINACION,
    descripcion: 'Eliminación directa 2v2. No hay empates.',
    fechaInicio: sumarDias(20),
    cierreInscripcion: sumarDias(15),
    cupoMaximo: 4,
    estado: EstadoTorneo.ABIERTO,
  });
  await torneos.save({
    nombre: 'Torneo FIFA Verano',
    videojuego: 'EA FC',
    modalidad: Modalidad.LIGA,
    descripcion: 'Torneo 1v1 de verano.',
    fechaInicio: sumarDias(45),
    cierreInscripcion: sumarDias(40),
    cupoMaximo: 8,
    estado: EstadoTorneo.ABIERTO,
  });

  const inscripciones = ds.getRepository(Inscripcion);
  await inscripciones.save([
    ...eq.slice(0, 4).map((e) => ({ torneoId: liga.id, equipoId: e.id, estado: EstadoInscripcion.ACEPTADA })),
    { torneoId: copa.id, equipoId: eq[4].id, estado: EstadoInscripcion.ACEPTADA },
    { torneoId: copa.id, equipoId: eq[5].id, estado: EstadoInscripcion.PENDIENTE },
  ]);

  // Partidos de la liga: fecha 1 y 2 jugadas, fecha 3 programada.
  const partidos = ds.getRepository(Partido);
  const resultados = ds.getRepository(Resultado);
  const fixture: [number, number, string, number, [number, number] | null][] = [
    [0, 1, 'Fecha 1', -9, [13, 9]],
    [2, 3, 'Fecha 1', -9, [11, 13]],
    [0, 2, 'Fecha 2', -5, [12, 12]],
    [1, 3, 'Fecha 2', -5, [13, 7]],
    [0, 3, 'Fecha 3', 3, null],
    [1, 2, 'Fecha 3', 3, null],
  ];
  for (const [l, v, ronda, dias, marcador] of fixture) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(18, 0, 0, 0);
    const partido = await partidos.save({
      torneoId: liga.id,
      equipoLocalId: eq[l].id,
      equipoVisitanteId: eq[v].id,
      fechaHora: fecha,
      ronda,
      estado: marcador ? EstadoPartido.FINALIZADO : EstadoPartido.PROGRAMADO,
    });
    if (marcador) {
      await resultados.save({
        partidoId: partido.id,
        puntajeLocal: marcador[0],
        puntajeVisitante: marcador[1],
        ganadorId: determinarGanador(partido, marcador[0], marcador[1], Modalidad.LIGA),
        registradoPor: admin.id,
      });
    }
  }

  console.log('Listo.');
  console.log('  ADMIN       -> admin@ipvg.cl / admin123');
  console.log('  ESTUDIANTES -> estudiante1@ipvg.cl ... estudiante8@ipvg.cl / clave123');
  await ds.destroy();
}

main().catch((err) => {
  console.error('Error al ejecutar el seed:', err.message);
  process.exit(1);
});
