<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import { ETIQUETAS, fechaHora } from '../services/formato'
import EstadoBadge from '../components/EstadoBadge.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const { esAdmin } = useAuth()

const partido = ref(null)
const cargando = ref(true)
const error = ref('')
const exito = ref('')
const noEncontrado = ref(false)

const marcador = ref({ puntajeLocal: 0, puntajeVisitante: 0 })
const intentoEnviar = ref(false)
const guardando = ref(false)
const confirmar = ref({ visible: false, mensaje: '', accion: null })

const permiteEmpate = computed(() => partido.value?.torneo.modalidad === 'LIGA')
const erroresMarcador = computed(() => {
  const { puntajeLocal: l, puntajeVisitante: v } = marcador.value
  if (!Number.isInteger(l) || !Number.isInteger(v) || l < 0 || v < 0) return 'Los puntajes deben ser enteros mayores o iguales a 0'
  if (l === v && !permiteEmpate.value) return 'En eliminación directa no se permiten empates'
  return ''
})
// Vista previa del ganador según el marcador ingresado
const ganadorPrevio = computed(() => {
  const { puntajeLocal: l, puntajeVisitante: v } = marcador.value
  if (l > v) return partido.value.equipoLocal.nombre
  if (v > l) return partido.value.equipoVisitante.nombre
  return 'Empate'
})

async function cargar() {
  try {
    partido.value = await api.partido(props.id)
  } catch (e) {
    if (e.status === 404) noEncontrado.value = true
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function registrar() {
  intentoEnviar.value = true
  error.value = exito.value = ''
  if (erroresMarcador.value) return
  guardando.value = true
  try {
    await api.registrarResultado({ partidoId: Number(props.id), ...marcador.value })
    exito.value = 'Resultado oficial registrado. El ranking fue actualizado.'
    await cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

function pedir(mensaje, accion) {
  confirmar.value = { visible: true, mensaje, accion }
}

async function confirmarAccion() {
  error.value = exito.value = ''
  try {
    await confirmar.value.accion()
  } catch (e) {
    error.value = e.message
  }
  confirmar.value.visible = false
}

const anularResultado = () =>
  pedir('Se eliminará el resultado oficial y el partido volverá a estado PROGRAMADO.', async () => {
    await api.eliminarResultado(partido.value.resultado.id)
    exito.value = 'Resultado eliminado'
    await cargar()
  })

const cancelarPartido = () =>
  pedir('El partido quedará CANCELADO.', async () => {
    await api.editarPartido(props.id, { estado: 'CANCELADO' })
    exito.value = 'Partido cancelado'
    await cargar()
  })

const eliminarPartido = () =>
  pedir('Se eliminará el partido definitivamente.', async () => {
    await api.eliminarPartido(props.id)
    router.push(`/torneos/${partido.value.torneoId}`)
  })

onMounted(cargar)
</script>

<template>
  <LoadingSpinner v-if="cargando" texto="Cargando partido..." />

  <div v-else-if="noEncontrado" class="panel">
    <EmptyState icono="🔍" :mensaje="error">
      <RouterLink to="/partidos" class="btn">Volver al calendario</RouterLink>
    </EmptyState>
  </div>

  <template v-else-if="partido">
    <RouterLink :to="`/torneos/${partido.torneoId}`" class="texto-suave">← {{ partido.torneo.nombre }}</RouterLink>
    <h1>{{ partido.ronda }}</h1>

    <AlertMessage v-if="exito" tipo="exito" :mensaje="exito" @cerrar="exito = ''" />
    <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

    <section class="panel marcador">
      <RouterLink :to="`/equipos/${partido.equipoLocal.id}`" class="equipo"
        :class="{ ganador: partido.resultado?.ganadorId === partido.equipoLocal.id }">
        {{ partido.equipoLocal.nombre }}<small>Local</small>
      </RouterLink>
      <div class="centro">
        <div v-if="partido.resultado" class="score">
          {{ partido.resultado.puntajeLocal }} : {{ partido.resultado.puntajeVisitante }}
        </div>
        <div v-else class="score vs">VS</div>
        <EstadoBadge :estado="partido.estado" />
        <small class="texto-suave">{{ fechaHora(partido.fechaHora) }}</small>
      </div>
      <RouterLink :to="`/equipos/${partido.equipoVisitante.id}`" class="equipo"
        :class="{ ganador: partido.resultado?.ganadorId === partido.equipoVisitante.id }">
        {{ partido.equipoVisitante.nombre }}<small>Visitante</small>
      </RouterLink>
    </section>

    <p v-if="partido.resultado" class="texto-suave centro-texto">
      {{ partido.resultado.ganador ? `🏆 Ganador: ${partido.resultado.ganador.nombre}` : '🤝 Empate' }}
    </p>

    <!-- Solo ADMIN: registrar resultado oficial -->
    <section v-if="esAdmin" class="panel">
      <template v-if="!partido.resultado && partido.estado === 'PROGRAMADO'">
        <h2>Registrar resultado oficial</h2>
        <p class="texto-suave">Modalidad: {{ ETIQUETAS[partido.torneo.modalidad] }}</p>
        <form class="form-resultado" @submit.prevent="registrar" novalidate>
          <div class="campo">
            <label>{{ partido.equipoLocal.nombre }}</label>
            <input type="number" min="0" v-model.number="marcador.puntajeLocal" />
          </div>
          <div class="campo">
            <label>{{ partido.equipoVisitante.nombre }}</label>
            <input type="number" min="0" v-model.number="marcador.puntajeVisitante" />
          </div>
          <div>
            <button class="btn" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Registrar' }}</button>
          </div>
        </form>
        <p v-if="intentoEnviar && erroresMarcador" class="error-campo">{{ erroresMarcador }}</p>
        <p v-else class="texto-suave">Resultado: <strong>{{ ganadorPrevio }}</strong></p>
      </template>

      <div class="acciones">
        <button v-if="partido.resultado" class="btn btn-sec" @click="anularResultado">Anular resultado</button>
        <button v-if="partido.estado === 'PROGRAMADO'" class="btn btn-sec" @click="cancelarPartido">Cancelar partido</button>
        <button class="btn btn-peligro" @click="eliminarPartido">Eliminar partido</button>
      </div>
    </section>
  </template>

  <ConfirmDialog
    :visible="confirmar.visible"
    :mensaje="confirmar.mensaje"
    texto-confirmar="Confirmar"
    @confirmar="confirmarAccion"
    @cancelar="confirmar.visible = false"
  />
</template>

<style scoped>
.marcador { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; text-align: center; }
.equipo { display: flex; flex-direction: column; font-size: 1.3rem; font-weight: 800; color: var(--texto); }
.equipo small { color: var(--suave); font-size: 0.8rem; font-weight: 400; }
.equipo.ganador { color: var(--ok); }
.centro { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.score { font-size: 2.5rem; font-weight: 900; color: var(--acento); }
.vs { color: var(--suave); font-size: 1.6rem; }
.centro-texto { text-align: center; }
.form-resultado { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end; }
.form-resultado > div:last-child { padding-bottom: 0.9rem; }
@media (max-width: 640px) {
  .form-resultado { grid-template-columns: 1fr; }
  .equipo { font-size: 1rem; }
}
</style>
