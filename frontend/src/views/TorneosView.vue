<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import TorneoCard from '../components/TorneoCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import AlertMessage from '../components/AlertMessage.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const { esAdmin } = useAuth()

const torneos = ref([])
const cargando = ref(true)
const error = ref('')

// Búsqueda y filtros combinables (v-model)
const busqueda = ref('')
const filtroJuego = ref('')
const filtroEstado = ref('')
const filtroModalidad = ref('')
const filtroDesde = ref('')
const mostrarFiltros = ref(true)

// computed: lista de videojuegos distintos para el <select>
const videojuegos = computed(() => [...new Set(torneos.value.map((t) => t.videojuego))].sort())

// computed: aplica todos los filtros a la vez
const torneosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return torneos.value.filter(
    (t) =>
      (!texto || t.nombre.toLowerCase().includes(texto) || t.videojuego.toLowerCase().includes(texto)) &&
      (!filtroJuego.value || t.videojuego === filtroJuego.value) &&
      (!filtroEstado.value || t.estado === filtroEstado.value) &&
      (!filtroModalidad.value || t.modalidad === filtroModalidad.value) &&
      (!filtroDesde.value || t.fechaInicio >= filtroDesde.value),
  )
})

const hayFiltros = computed(
  () => busqueda.value || filtroJuego.value || filtroEstado.value || filtroModalidad.value || filtroDesde.value,
)

function limpiarFiltros() {
  busqueda.value = filtroJuego.value = filtroEstado.value = filtroModalidad.value = filtroDesde.value = ''
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    torneos.value = await api.torneos()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="encabezado">
    <h1>Torneos</h1>
    <div class="acciones">
      <button class="btn btn-sec" @click="mostrarFiltros = !mostrarFiltros">
        {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </button>
      <RouterLink v-if="esAdmin" to="/torneos/nuevo" class="btn">+ Nuevo torneo</RouterLink>
    </div>
  </div>

  <!-- v-show: el panel de filtros se oculta pero conserva su estado en el DOM -->
  <div v-show="mostrarFiltros" class="panel filtros">
    <div>
      <label for="buscar">Buscar</label>
      <input id="buscar" v-model="busqueda" placeholder="Nombre o videojuego..." />
    </div>
    <div>
      <label>Videojuego</label>
      <select v-model="filtroJuego">
        <option value="">Todos</option>
        <option v-for="j in videojuegos" :key="j" :value="j">{{ j }}</option>
      </select>
    </div>
    <div>
      <label>Estado</label>
      <select v-model="filtroEstado">
        <option value="">Todos</option>
        <option value="ABIERTO">Inscripciones abiertas</option>
        <option value="EN_CURSO">En curso</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
    </div>
    <div>
      <label>Modalidad</label>
      <select v-model="filtroModalidad">
        <option value="">Todas</option>
        <option value="LIGA">Liga</option>
        <option value="ELIMINACION">Eliminación directa</option>
      </select>
    </div>
    <div>
      <label>Inicia desde</label>
      <input type="date" v-model="filtroDesde" />
    </div>
  </div>

  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />
  <LoadingSpinner v-if="cargando" texto="Cargando torneos..." />

  <template v-else-if="!error">
    <p class="texto-suave">
      {{ torneosFiltrados.length }} de {{ torneos.length }} torneos
      <button v-if="hayFiltros" class="btn btn-sec btn-chico" @click="limpiarFiltros">Limpiar filtros</button>
    </p>
    <div v-if="torneosFiltrados.length" class="grid">
      <TorneoCard
        v-for="torneo in torneosFiltrados"
        :key="torneo.id"
        :torneo="torneo"
        @ver="(id) => router.push({ name: 'torneo-detalle', params: { id } })"
      />
    </div>
    <EmptyState v-else :mensaje="hayFiltros ? 'Ningún torneo coincide con la búsqueda.' : 'Aún no hay torneos.'" />
  </template>
  <button v-if="error" class="btn" @click="cargar">Reintentar</button>
</template>
