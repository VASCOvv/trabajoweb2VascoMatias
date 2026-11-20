<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../services/api'
import PartidoItem from '../components/PartidoItem.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const partidos = ref([])
const torneos = ref([])
const cargando = ref(true)
const error = ref('')

const busqueda = ref('')
const filtroTorneo = ref('')
const filtroEstado = ref('')

const partidosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase()
  return partidos.value.filter(
    (p) =>
      (!texto ||
        p.equipoLocal.nombre.toLowerCase().includes(texto) ||
        p.equipoVisitante.nombre.toLowerCase().includes(texto) ||
        p.ronda.toLowerCase().includes(texto)) &&
      (!filtroTorneo.value || p.torneoId === Number(filtroTorneo.value)) &&
      (!filtroEstado.value || p.estado === filtroEstado.value),
  )
})

onMounted(async () => {
  try {
    const [p, t] = await Promise.all([api.partidos(), api.torneos()])
    partidos.value = p
    torneos.value = t
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <h1>Calendario de partidos</h1>

  <div class="panel filtros">
    <div>
      <label>Buscar</label>
      <input v-model="busqueda" placeholder="Equipo o ronda..." />
    </div>
    <div>
      <label>Torneo</label>
      <select v-model="filtroTorneo">
        <option value="">Todos</option>
        <option v-for="t in torneos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
      </select>
    </div>
    <div>
      <label>Estado</label>
      <select v-model="filtroEstado">
        <option value="">Todos</option>
        <option value="PROGRAMADO">Programado</option>
        <option value="FINALIZADO">Finalizado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
    </div>
  </div>

  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />
  <LoadingSpinner v-if="cargando" texto="Cargando partidos..." />
  <template v-else-if="!error">
    <PartidoItem v-for="p in partidosFiltrados" :key="p.id" :partido="p" mostrar-torneo />
    <EmptyState v-if="!partidosFiltrados.length" icono="📅" mensaje="No hay partidos que coincidan." />
  </template>
</template>
