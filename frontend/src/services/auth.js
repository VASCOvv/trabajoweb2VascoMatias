// Estado global de autenticación (reactivo) compartido por toda la app.
// Se guarda en localStorage para mantener la sesión al recargar la página.
import { computed, ref } from 'vue'

const token = ref(localStorage.getItem('token'))
const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

export const estaAutenticado = computed(() => !!token.value)
export const esAdmin = computed(() => usuario.value?.rol === 'ADMIN')

export function useAuth() {
  return { token, usuario, estaAutenticado, esAdmin, guardarSesion, actualizarUsuario, cerrarSesion }
}

export function guardarSesion(nuevoToken, datosUsuario) {
  token.value = nuevoToken
  usuario.value = datosUsuario
  localStorage.setItem('token', nuevoToken)
  localStorage.setItem('usuario', JSON.stringify(datosUsuario))
}

export function actualizarUsuario(datosUsuario) {
  usuario.value = datosUsuario
  localStorage.setItem('usuario', JSON.stringify(datosUsuario))
}

export function cerrarSesion() {
  token.value = null
  usuario.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export function getToken() {
  return token.value
}
