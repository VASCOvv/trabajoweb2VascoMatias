<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import TorneoCard from '../components/TorneoCard.vue'
import PartidoItem from '../components/PartidoItem.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import AlertMessage from '../components/AlertMessage.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { usuario, estaAutenticado } = useAuth()

const torneos = ref([])
const partidos = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref(route.query.aviso === 'sin-permiso' ? 'No tiene permisos para acceder a esa sección.' : '')

const torneosActivos = computed(() => torneos.value.filter((t) => ['ABIERTO', 'EN_CURSO'].includes(t.estado)))
const proximosPartidos = computed(() => partidos.value.slice(0, 5))

onMounted(async () => {
  try {
    const [t, p] = await Promise.all([api.torneos(), api.partidos({ estado: 'PROGRAMADO' })])
    torneos.value = t
    partidos.value = p
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="hero panel">
    <h1>Torneos de videojuegos y eSports del IPVG</h1>
    <p class="texto-suave">
      Forma tu equipo, inscríbete en torneos, sigue el calendario de partidos y revisa el ranking en tiempo real.
    </p>
    <div class="acciones">
      <RouterLink to="/torneos" class="btn">Ver torneos</RouterLink>
      <RouterLink v-if="!estaAutenticado" to="/registro" class="btn btn-sec">Crear cuenta</RouterLink>
      <span v-else class="texto-suave">Hola, <strong>{{ usuario.nombre }}</strong> 👋</span>
    </div>
  </section>

  <AlertMessage v-if="aviso" tipo="aviso" :mensaje="aviso" @cerrar="aviso = ''; router.replace('/')" />
  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

  <LoadingSpinner v-if="cargando" />
  <template v-else-if="!error">
    <h2>Torneos activos</h2>
    <div v-if="torneosActivos.length" class="grid">
      <TorneoCard v-for="t in torneosActivos" :key="t.id" :torneo="t" @ver="(id) => router.push(`/torneos/${id}`)" />
    </div>
    <EmptyState v-else mensaje="No hay torneos activos por ahora." />

    <h2 style="margin-top: 2rem">Próximos partidos</h2>
    <div v-if="proximosPartidos.length">
      <PartidoItem v-for="p in proximosPartidos" :key="p.id" :partido="p" mostrar-torneo />
    </div>
    <EmptyState v-else icono="📅" mensaje="No hay partidos programados." />
  </template>
</template>

<style scoped>
.hero { background: linear-gradient(135deg, rgba(124, 92, 255, 0.25), rgba(34, 211, 238, 0.1)), var(--panel); }
.hero h1 { font-size: 2rem; }
</style>
