import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Torneo } from '../torneos/torneo.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';
import { Partido } from '../partidos/partido.entity';
import { Resultado } from '../resultados/resultado.entity';

export const ENTIDADES = [Usuario, Equipo, Torneo, Inscripcion, Partido, Resultado];

// Configuración de MySQL leída desde variables de entorno (.env).
export function opcionesBaseDatos(): DataSourceOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'gamehub_ipvg',
    entities: ENTIDADES,
    synchronize: process.env.DB_SYNC === 'true',
    timezone: 'local',
  };
}
