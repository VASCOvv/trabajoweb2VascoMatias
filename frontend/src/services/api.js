// Cliente HTTP basado en fetch() para consumir la API NestJS.
import { cerrarSesion, getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Hace una petición a la API y devuelve el JSON.
 * Lanza un Error con un mensaje legible si algo falla.
 */
export async function request(ruta, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch solo falla así cuando no hay conexión con el backend
    throw new Error('No se pudo conectar con el servidor. Verifique que la API esté encendida.')
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) cerrarSesion() // token vencido
    // NestJS devuelve { message } (string o arreglo de errores de validación)
    const msg = Array.isArray(datos?.message) ? datos.message.join('. ') : datos?.message
    const error = new Error(msg || `Error ${respuesta.status}`)
    error.status = respuesta.status
    throw error
  }
  return datos
}

// Arma un query string ignorando valores vacíos: { q: 'a', estado: '' } -> '?q=a'
export function query(params) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) qs.append(k, v)
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export const api = {
  // Auth y perfil
  login: (datos) => request('/auth/login', { method: 'POST', body: datos }),
  register: (datos) => request('/auth/register', { method: 'POST', body: datos }),
  perfil: () => request('/usuarios/me'),
  actualizarPerfil: (datos) => request('/usuarios/me', { method: 'PATCH', body: datos }),
  usuarios: () => request('/usuarios'),

  // Torneos
  torneos: (filtros = {}) => request(`/torneos${query(filtros)}`),
  torneo: (id) => request(`/torneos/${id}`),
  ranking: (id) => request(`/torneos/${id}/ranking`),
  crearTorneo: (datos) => request('/torneos', { method: 'POST', body: datos }),
  editarTorneo: (id, datos) => request(`/torneos/${id}`, { method: 'PATCH', body: datos }),
  eliminarTorneo: (id) => request(`/torneos/${id}`, { method: 'DELETE' }),

  // Equipos
  equipos: (filtros = {}) => request(`/equipos${query(filtros)}`),
  equipo: (id) => request(`/equipos/${id}`),
  crearEquipo: (datos) => request('/equipos', { method: 'POST', body: datos }),
  editarEquipo: (id, datos) => request(`/equipos/${id}`, { method: 'PATCH', body: datos }),
  eliminarEquipo: (id) => request(`/equipos/${id}`, { method: 'DELETE' }),
  agregarIntegrante: (id, usuarioId) =>
    request(`/equipos/${id}/integrantes`, { method: 'POST', body: { usuarioId } }),
  quitarIntegrante: (id, usuarioId) => request(`/equipos/${id}/integrantes/${usuarioId}`, { method: 'DELETE' }),

  // Inscripciones
  inscribir: (torneoId, equipoId) => request('/inscripciones', { method: 'POST', body: { torneoId, equipoId } }),
  cambiarEstadoInscripcion: (id, estado) =>
    request(`/inscripciones/${id}/estado`, { method: 'PATCH', body: { estado } }),
  eliminarInscripcion: (id) => request(`/inscripciones/${id}`, { method: 'DELETE' }),

  // Partidos
  partidos: (filtros = {}) => request(`/partidos${query(filtros)}`),
  partido: (id) => request(`/partidos/${id}`),
  crearPartido: (datos) => request('/partidos', { method: 'POST', body: datos }),
  editarPartido: (id, datos) => request(`/partidos/${id}`, { method: 'PATCH', body: datos }),
  eliminarPartido: (id) => request(`/partidos/${id}`, { method: 'DELETE' }),

  // Resultados
  registrarResultado: (datos) => request('/resultados', { method: 'POST', body: datos }),
  eliminarResultado: (id) => request(`/resultados/${id}`, { method: 'DELETE' }),
}
