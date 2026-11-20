<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import { ETIQUETAS, fecha } from '../services/formato'
import EstadoBadge from '../components/EstadoBadge.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import RankingTable from '../components/RankingTable.vue'
import PartidoItem from '../components/PartidoItem.vue'

// :id llega como prop gracias a "props: true" en el router
const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const route = useRoute()
const { usuario, estaAutenticado, esAdmin } = useAuth()

const torneo = ref(null)
const ranking = ref([])
const partidos = ref([])
const misEquipos = ref([])
const cargando = ref(true)
const error = ref('')
const noEncontrado = ref(false)
const exito = ref(route.query.ok ? `Torneo ${route.query.ok} correctamente` : '')
const tab = ref('inscripciones')

// Confirmación de eliminaciones
const confirmar = ref({ visible: false, mensaje: '', accion: null })
const procesando = ref(false)

// Formulario de inscripción
const equipoAInscribir = ref('')

// Formulario de nuevo partido (ADMIN)
const nuevoPartido = ref({ equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' })
const intentoPartido = ref(false)

// --- computed ---
const inscripcionesActivas = computed(() => torneo.value?.inscripciones.filter((i) => i.estado !== 'RECHAZADA') ?? [])
const equiposAceptados = computed(
  () => torneo.value?.inscripciones.filter((i) => i.estado === 'ACEPTADA').map((i) => i.equipo) ?? [],
)
const cuposLibres = computed(() => (torneo.value ? torneo.value.cupoMaximo - inscripcionesActivas.value.length : 0))
const hoy = new Date().toISOString().slice(0, 10)
const inscripcionAbierta = computed(
  () => torneo.value?.estado === 'ABIERTO' && torneo.value.cierreInscripcion >= hoy && cuposLibres.value > 0,
)
// Equipos del usuario (como capitán) que aún no están inscritos en este torneo
const equiposDisponibles = computed(() => {
  const inscritos = new Set(torneo.value?.inscripciones.map((i) => i.equipoId))
  return misEquipos.value.filter((e) => !inscritos.has(e.id))
})
const erroresPartido = computed(() => {
  const p = nuevoPartido.value
  const e = {}
  if (!p.equipoLocalId) e.equipoLocalId = 'Seleccione equipo local'
  if (!p.equipoVisitanteId) e.equipoVisitanteId = 'Seleccione equipo visitante'
  if (p.equipoLocalId && p.equipoLocalId === p.equipoVisitanteId) e.equipoVisitanteId = 'Debe ser un equipo distinto'
  if (!p.fechaHora) e.fechaHora = 'Indique fecha y hora'
  if (!p.ronda.trim()) e.ronda = 'Indique la ronda'
  return e
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [t, r, p] = await Promise.all([api.torneo(props.id), api.ranking(props.id), api.partidos({ torneoId: props.id })])
    torneo.value = t
    ranking.value = r
    partidos.value = p
    if (estaAutenticado.value) {
      const equipos = await api.equipos()
      misEquipos.value = equipos.filter((e) => e.capitanId === usuario.value.id && e.estado === 'ACTIVO')
    }
  } catch (e) {
    if (e.status === 404) noEncontrado.value = true
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function ejecutar(fn, mensajeOk) {
  error.value = exito.value = ''
  try {
    await fn()
    exito.value = mensajeOk
    await cargar()
  } catch (e) {
    error.value = e.message
  }
}

function inscribir() {
  if (!equipoAInscribir.value) return
  ejecutar(() => api.inscribir(Number(props.id), Number(equipoAInscribir.value)), 'Equipo inscrito. Queda pendiente de aprobación.')
  equipoAInscribir.value = ''
}

function cambiarEstado(insc, estado) {
  ejecutar(() => api.cambiarEstadoInscripcion(insc.id, estado), `Inscripción de ${insc.equipo.nombre} ${estado.toLowerCase()}`)
}

function programarPartido() {
  intentoPartido.value = true
  if (Object.keys(erroresPartido.value).length) return
  const p = nuevoPartido.value
  ejecutar(
    () =>
      api.crearPartido({
        torneoId: Number(props.id),
        equipoLocalId: Number(p.equipoLocalId),
        equipoVisitanteId: Number(p.equipoVisitanteId),
        fechaHora: p.fechaHora,
        ronda: p.ronda.trim(),
      }),
    'Partido programado',
  )
  nuevoPartido.value = { equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' }
  intentoPartido.value = false
}

function pedirConfirmacion(mensaje, accion) {
  confirmar.value = { visible: true, mensaje, accion }
}

async function confirmarAccion() {
  procesando.value = true
  await confirmar.value.accion()
  procesando.value = false
  confirmar.value.visible = false
}

function eliminarTorneo() {
  pedirConfirmacion(`Se eliminará "${torneo.value.nombre}" con sus inscripciones, partidos y resultados.`, async () => {
    try {
      await api.eliminarTorneo(props.id)
      router.push('/torneos')
    } catch (e) {
      error.value = e.message
    }
  })
}

function anularInscripcion(insc) {
  pedirConfirmacion(`Se anulará la inscripción de "${insc.equipo.nombre}".`, () =>
    ejecutar(() => api.eliminarInscripcion(insc.id), 'Inscripción anulada'),
  )
}

const puedeAnular = (insc) => esAdmin.value || insc.equipo.capitanId === usuario.value?.id

onMounted(cargar)
</script>

<template>
  <LoadingSpinner v-if="cargando && !torneo" texto="Cargando torneo..." />

  <div v-else-if="noEncontrado" class="panel">
    <EmptyState icono="🔍" :mensaje="error">
      <RouterLink to="/torneos" class="btn">Volver a torneos</RouterLink>
    </EmptyState>
  </div>

  <template v-else-if="torneo">
    <div class="encabezado">
      <div>
        <RouterLink to="/torneos" class="texto-suave">← Torneos</RouterLink>
        <h1>{{ torneo.nombre }}</h1>
      </div>
      <div v-if="esAdmin" class="acciones">
        <RouterLink :to="`/torneos/${torneo.id}/editar`" class="btn btn-sec">Editar</RouterLink>
        <button class="btn btn-peligro" @click="eliminarTorneo">Eliminar</button>
      </div>
    </div>

    <AlertMessage v-if="exito" tipo="exito" :mensaje="exito" @cerrar="exito = ''" />
    <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

    <section class="panel info">
      <div><span class="texto-suave">Videojuego</span><strong>{{ torneo.videojuego }}</strong></div>
      <div><span class="texto-suave">Modalidad</span><strong>{{ ETIQUETAS[torneo.modalidad] }}</strong></div>
      <div><span class="texto-suave">Estado</span><EstadoBadge :estado="torneo.estado" /></div>
      <div><span class="texto-suave">Inicio</span><strong>{{ fecha(torneo.fechaInicio) }}</strong></div>
      <div><span class="texto-suave">Cierre inscripción</span><strong>{{ fecha(torneo.cierreInscripcion) }}</strong></div>
      <div><span class="texto-suave">Cupo</span><strong>{{ inscripcionesActivas.length }} / {{ torneo.cupoMaximo }}</strong></div>
      <p v-if="torneo.descripcion" class="descripcion">{{ torneo.descripcion }}</p>
    </section>

    <div class="tabs">
      <button :class="{ activo: tab === 'inscripciones' }" @click="tab = 'inscripciones'">
        Inscripciones ({{ torneo.inscripciones.length }})
      </button>
      <button :class="{ activo: tab === 'partidos' }" @click="tab = 'partidos'">Partidos ({{ partidos.length }})</button>
      <button :class="{ activo: tab === 'ranking' }" @click="tab = 'ranking'">Tabla de posiciones</button>
    </div>

    <!-- INSCRIPCIONES -->
    <section v-if="tab === 'inscripciones'" class="panel">
      <div v-if="estaAutenticado && !esAdmin" class="inscribir">
        <template v-if="inscripcionAbierta">
          <template v-if="equiposDisponibles.length">
            <select v-model="equipoAInscribir">
              <option value="">Seleccione uno de sus equipos...</option>
              <option v-for="e in equiposDisponibles" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
            <button class="btn" :disabled="!equipoAInscribir" @click="inscribir">Inscribir equipo</button>
          </template>
          <p v-else class="texto-suave">
            Debe ser capitán de un equipo activo no inscrito para inscribirse.
            <RouterLink to="/equipos">Crear equipo</RouterLink>
          </p>
        </template>
        <p v-else class="texto-suave">⛔ Inscripciones cerradas (fecha de cierre pasada, torneo no abierto o cupo completo).</p>
      </div>
      <p v-else-if="!estaAutenticado" class="texto-suave">
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }">Inicia sesión</RouterLink> para inscribir a tu equipo.
      </p>

      <div v-if="torneo.inscripciones.length" class="tabla-scroll">
        <table>
          <thead>
            <tr><th>Equipo</th><th>Capitán</th><th>Fecha</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="insc in torneo.inscripciones" :key="insc.id">
              <td><RouterLink :to="`/equipos/${insc.equipo.id}`">{{ insc.equipo.nombre }}</RouterLink></td>
              <td>{{ insc.equipo.capitan?.alias }}</td>
              <td>{{ fecha(insc.fecha) }}</td>
              <td><EstadoBadge :estado="insc.estado" /></td>
              <td class="acciones">
                <template v-if="esAdmin">
                  <button v-if="insc.estado !== 'ACEPTADA'" class="btn btn-ok btn-chico" @click="cambiarEstado(insc, 'ACEPTADA')">Aceptar</button>
                  <button v-if="insc.estado !== 'RECHAZADA'" class="btn btn-sec btn-chico" @click="cambiarEstado(insc, 'RECHAZADA')">Rechazar</button>
                </template>
                <button v-if="puedeAnular(insc)" class="btn btn-peligro btn-chico" @click="anularInscripcion(insc)">Anular</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else icono="📝" mensaje="Aún no hay equipos inscritos." />
    </section>

    <!-- PARTIDOS -->
    <section v-else-if="tab === 'partidos'" class="panel">
      <form v-if="esAdmin" class="nuevo-partido" @submit.prevent="programarPartido" novalidate>
        <h2>Programar partido</h2>
        <p v-if="equiposAceptados.length < 2" class="texto-suave">Se necesitan al menos 2 equipos con inscripción aceptada.</p>
        <div v-else class="form-grid">
          <div class="campo">
            <label>Local</label>
            <select v-model="nuevoPartido.equipoLocalId" :class="{ invalido: intentoPartido && erroresPartido.equipoLocalId }">
              <option value="">—</option>
              <option v-for="e in equiposAceptados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
            <p v-if="intentoPartido && erroresPartido.equipoLocalId" class="error-campo">{{ erroresPartido.equipoLocalId }}</p>
          </div>
          <div class="campo">
            <label>Visitante</label>
            <select v-model="nuevoPartido.equipoVisitanteId" :class="{ invalido: intentoPartido && erroresPartido.equipoVisitanteId }">
              <option value="">—</option>
              <option v-for="e in equiposAceptados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
            <p v-if="intentoPartido && erroresPartido.equipoVisitanteId" class="error-campo">{{ erroresPartido.equipoVisitanteId }}</p>
          </div>
          <div class="campo">
            <label>Fecha y hora</label>
            <input type="datetime-local" v-model="nuevoPartido.fechaHora" :class="{ invalido: intentoPartido && erroresPartido.fechaHora }" />
            <p v-if="intentoPartido && erroresPartido.fechaHora" class="error-campo">{{ erroresPartido.fechaHora }}</p>
          </div>
          <div class="campo">
            <label>Ronda</label>
            <input v-model="nuevoPartido.ronda" placeholder="Fecha 1, Semifinal..." :class="{ invalido: intentoPartido && erroresPartido.ronda }" />
            <p v-if="intentoPartido && erroresPartido.ronda" class="error-campo">{{ erroresPartido.ronda }}</p>
          </div>
          <div><button class="btn">Programar</button></div>
        </div>
      </form>

      <div v-if="partidos.length">
        <PartidoItem v-for="p in partidos" :key="p.id" :partido="p" />
      </div>
      <EmptyState v-else icono="📅" mensaje="No hay partidos programados en este torneo." />
    </section>

    <!-- RANKING -->
    <section v-else class="panel">
      <p class="texto-suave">Calculado automáticamente a partir de los resultados oficiales · Victoria 3 pts · Empate 1 pt.</p>
      <RankingTable v-if="ranking.length" :filas="ranking" />
      <EmptyState v-else icono="🏆" mensaje="El ranking aparecerá cuando haya equipos aceptados." />
    </section>
  </template>

  <ConfirmDialog
    :visible="confirmar.visible"
    :mensaje="confirmar.mensaje"
    :cargando="procesando"
    @confirmar="confirmarAccion"
    @cancelar="confirmar.visible = false"
  />
</template>

<style scoped>
.info { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.info div { display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; }
.descripcion { grid-column: 1 / -1; margin: 0; }
.inscribir { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.inscribir select { max-width: 320px; }
.nuevo-partido { border-bottom: 1px solid var(--borde); margin-bottom: 1rem; padding-bottom: 0.5rem; }
.nuevo-partido .form-grid { align-items: start; }
.nuevo-partido .form-grid > div:last-child { padding-top: 1.6rem; }
</style>
