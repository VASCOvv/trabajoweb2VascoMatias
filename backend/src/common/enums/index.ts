// Enumeraciones compartidas por todo el backend.

export enum Rol {
  ADMIN = 'ADMIN',
  ESTUDIANTE = 'ESTUDIANTE',
}

export enum EstadoEquipo {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

// LIGA: todos contra todos, se permite empate.
// ELIMINACION: eliminación directa, NO se permite empate.
export enum Modalidad {
  LIGA = 'LIGA',
  ELIMINACION = 'ELIMINACION',
}

export enum EstadoTorneo {
  ABIERTO = 'ABIERTO', // acepta inscripciones (si no pasó la fecha de cierre)
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

export enum EstadoInscripcion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
}

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}
