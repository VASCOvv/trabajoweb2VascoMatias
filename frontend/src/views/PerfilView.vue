<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../services/api'
import { actualizarUsuario } from '../services/auth'
import { ETIQUETAS } from '../services/formato'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const perfil = ref(null)
const form = ref({ nombre: '', alias: '', password: '' })
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const exito = ref('')
const intentoEnviar = ref(false)

const errores = computed(() => {
  const e = {}
  if (form.value.nombre.length < 3) e.nombre = 'Mínimo 3 caracteres'
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(form.value.alias)) e.alias = 'Alias de 3 a 50 caracteres (letras, números o _)'
  if (form.value.password && form.value.password.length < 6) e.password = 'Mínimo 6 caracteres'
  return e
})

onMounted(async () => {
  try {
    perfil.value = await api.perfil()
    form.value.nombre = perfil.value.nombre
    form.value.alias = perfil.value.alias
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  intentoEnviar.value = true
  exito.value = error.value = ''
  if (Object.keys(errores.value).length) return
  guardando.value = true
  try {
    const datos = { nombre: form.value.nombre, alias: form.value.alias }
    if (form.value.password) datos.password = form.value.password
    perfil.value = await api.actualizarPerfil(datos)
    const { equipos, equiposCapitan, ...basico } = perfil.value
    actualizarUsuario(basico)
    form.value.password = ''
    exito.value = 'Perfil actualizado correctamente'
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <h1>Mi perfil</h1>
  <AlertMessage v-if="exito" tipo="exito" :mensaje="exito" @cerrar="exito = ''" />
  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />
  <LoadingSpinner v-if="cargando" />

  <div v-else-if="perfil" class="columnas">
    <form class="panel" @submit.prevent="guardar" novalidate>
      <p class="texto-suave">{{ perfil.correo }} · {{ ETIQUETAS[perfil.rol] }}</p>
      <div class="campo">
        <label>Nombre</label>
        <input v-model.trim="form.nombre" :class="{ invalido: intentoEnviar && errores.nombre }" />
        <p v-if="intentoEnviar && errores.nombre" class="error-campo">{{ errores.nombre }}</p>
      </div>
      <div class="campo">
        <label>Alias</label>
        <input v-model.trim="form.alias" :class="{ invalido: intentoEnviar && errores.alias }" />
        <p v-if="intentoEnviar && errores.alias" class="error-campo">{{ errores.alias }}</p>
      </div>
      <div class="campo">
        <label>Nueva contraseña (opcional)</label>
        <input v-model="form.password" type="password" :class="{ invalido: intentoEnviar && errores.password }" />
        <p v-if="intentoEnviar && errores.password" class="error-campo">{{ errores.password }}</p>
      </div>
      <button class="btn" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar cambios' }}</button>
    </form>

    <div class="panel">
      <h2>Mis equipos</h2>
      <ul v-if="perfil.equipos.length">
        <li v-for="e in perfil.equipos" :key="e.id">
          <RouterLink :to="`/equipos/${e.id}`">{{ e.nombre }}</RouterLink>
          <span v-if="e.capitanId === perfil.id" class="badge">Capitán</span>
        </li>
      </ul>
      <EmptyState v-else icono="👥" mensaje="Aún no perteneces a ningún equipo.">
        <RouterLink to="/equipos" class="btn btn-chico">Crear un equipo</RouterLink>
      </EmptyState>
    </div>
  </div>
</template>

<style scoped>
.columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
li { margin-bottom: 0.4rem; }
li .badge { margin-left: 0.4rem; }
</style>
