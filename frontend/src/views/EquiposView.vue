<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import EstadoBadge from '../components/EstadoBadge.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const { estaAutenticado } = useAuth()

const equipos = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroJuego = ref('')
const filtroEstado = ref('')

const mostrarForm = ref(false)
const form = ref({ nombre: '', juegoPreferido: '' })
const intentoEnviar = ref(false)
const guardando = ref(false)

const juegos = computed(() => [...new Set(equipos.value.map((e) => e.juegoPreferido))].sort())

const equiposFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return equipos.value.filter(
    (e) =>
      (!texto || e.nombre.toLowerCase().includes(texto) || e.capitan?.alias.toLowerCase().includes(texto)) &&
      (!filtroJuego.value || e.juegoPreferido === filtroJuego.value) &&
      (!filtroEstado.value || e.estado === filtroEstado.value),
  )
})

const errores = computed(() => {
  const e = {}
  if (form.value.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'
  if (form.value.juegoPreferido.trim().length < 2) e.juegoPreferido = 'Indique el juego preferido'
  return e
})

async function cargar() {
  cargando.value = true
  try {
    equipos.value = await api.equipos()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function crear() {
  intentoEnviar.value = true
  error.value = ''
  if (Object.keys(errores.value).length) return
  guardando.value = true
  try {
    const equipo = await api.crearEquipo({ nombre: form.value.nombre.trim(), juegoPreferido: form.value.juegoPreferido.trim() })
    router.push({ name: 'equipo-detalle', params: { id: equipo.id } })
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="encabezado">
    <h1>Equipos</h1>
    <button v-if="estaAutenticado" class="btn" @click="mostrarForm = !mostrarForm">
      {{ mostrarForm ? 'Cerrar' : '+ Crear equipo' }}
    </button>
  </div>

  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

  <form v-if="mostrarForm" class="panel" @submit.prevent="crear" novalidate>
    <h2>Nuevo equipo</h2>
    <p class="texto-suave">Quedarás como capitán del equipo.</p>
    <div class="form-grid">
      <div class="campo">
        <label>Nombre del equipo</label>
        <input v-model="form.nombre" :class="{ invalido: intentoEnviar && errores.nombre }" />
        <p v-if="intentoEnviar && errores.nombre" class="error-campo">{{ errores.nombre }}</p>
      </div>
      <div class="campo">
        <label>Juego preferido</label>
        <input v-model="form.juegoPreferido" :class="{ invalido: intentoEnviar && errores.juegoPreferido }" />
        <p v-if="intentoEnviar && errores.juegoPreferido" class="error-campo">{{ errores.juegoPreferido }}</p>
      </div>
    </div>
    <button class="btn" :disabled="guardando">{{ guardando ? 'Creando...' : 'Crear equipo' }}</button>
  </form>

  <div class="panel filtros">
    <div>
      <label>Buscar</label>
      <input v-model="busqueda" placeholder="Nombre del equipo o capitán..." />
    </div>
    <div>
      <label>Juego</label>
      <select v-model="filtroJuego">
        <option value="">Todos</option>
        <option v-for="j in juegos" :key="j">{{ j }}</option>
      </select>
    </div>
    <div>
      <label>Estado</label>
      <select v-model="filtroEstado">
        <option value="">Todos</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>
  </div>

  <LoadingSpinner v-if="cargando" texto="Cargando equipos..." />
  <template v-else>
    <div v-if="equiposFiltrados.length" class="panel tabla-scroll">
      <table>
        <thead>
          <tr><th>Equipo</th><th>Juego</th><th>Capitán</th><th>Integrantes</th><th>Estado</th></tr>
        </thead>
        <tbody>
          <tr v-for="e in equiposFiltrados" :key="e.id">
            <td><RouterLink :to="`/equipos/${e.id}`">{{ e.nombre }}</RouterLink></td>
            <td>{{ e.juegoPreferido }}</td>
            <td>{{ e.capitan?.alias }}</td>
            <td>{{ e.integrantes.length }}</td>
            <td><EstadoBadge :estado="e.estado" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else icono="👥" mensaje="No se encontraron equipos." />
  </template>
</template>
