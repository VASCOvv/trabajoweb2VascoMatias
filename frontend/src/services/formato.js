// Funciones de formato reutilizables.

export function fecha(valor) {
  if (!valor) return '—'
  // 'YYYY-MM-DD' se interpreta como fecha local para evitar desfase de zona horaria
  const d = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fechaHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const ETIQUETAS = {
  ABIERTO: 'Inscripciones abiertas',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  PROGRAMADO: 'Programado',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  LIGA: 'Liga',
  ELIMINACION: 'Eliminación directa',
  ADMIN: 'Administrador',
  ESTUDIANTE: 'Estudiante',
}
