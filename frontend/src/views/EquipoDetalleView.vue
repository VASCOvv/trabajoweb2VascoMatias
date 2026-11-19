<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../services/auth'
import { fecha } from '../services/formato'
import EstadoBadge from '../components/EstadoBadge.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import PartidoItem from '../components/PartidoItem.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const { usuario, esAdmin, estaAutenticado } = useAuth()

const equipo = ref(null)
const partidos = ref([])
const usuarios = ref([])
const cargando = ref(true)
const error = ref('')
const exito = ref('')
const noEncontrado = ref(false)

const editando = ref(false)
const form = ref({ nombre: '', juegoPreferido: '', estado: 'ACTIVO' })
const nuevoIntegrante = ref('')
const confirmar = ref({ visible: false, mensaje: '', accion: null })

// Puede gestionar el equipo: su capitán o un administrador
const puedeGestionar = computed(() => esAdmin.value || equipo.value?.capitanId === usuario.value?.id)
const usuariosDisponibles = computed(() => {
  const ids = new Set(equipo.value?.integrantes.map((i) => i.id))
  return usuarios.value.filter((u) => !ids.has(u.id) && u.activo)
})

async function cargar() {
  try {
    const [e, p] = await Promise.all([api.equipo(props.id), api.partidos({ equipoId: props.id })])
    equipo.value = e
    partidos.value = p
    form.value = { nombre: e.nombre, juegoPreferido: e.juegoPreferido, estado: e.estado }
    if (estaAutenticado.value && puedeGestionar.value && !usuarios.value.length) {
      usuarios.value = await api.usuarios()
    }
  } catch (e) {
    if (e.status === 404) noEncontrado.value = true
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function ejecutar(fn, ok) {
  error.value = exito.value = ''
  try {
    await fn()
    exito.value = ok
    await cargar()
  } catch (e) {
    error.value = e.message
  }
}

function guardar() {
  if (form.value.nombre.trim().length < 3 || form.value.juegoPreferido.trim().length < 2) {
    error.value = 'Complete nombre (mín. 3) y juego preferido (mín. 2)'
    return
  }
  ejecutar(() => api.editarEquipo(props.id, form.value), 'Equipo actualizado')
  editando.value = false
}

function agregar() {
  if (!nuevoIntegrante.value) return
  ejecutar(() => api.agregarIntegrante(props.id, Number(nuevoIntegrante.value)), 'Integrante agregado')
  nuevoIntegrante.value = ''
}

function quitar(u) {
  confirmar.value = {
    visible: true,
    mensaje: `¿Quitar a ${u.alias} del equipo?`,
    accion: () => ejecutar(() => api.quitarIntegrante(props.id, u.id), 'Integrante quitado'),
  }
}

function eliminar() {
  confirmar.value = {
    visible: true,
    mensaje: `Se eliminará el equipo "${equipo.value.nombre}" y sus inscripciones.`,
    accion: async () => {
      try {
        await api.eliminarEquipo(props.id)
        router.push('/equipos')
      } catch (e) {
        error.value = e.message
      }
    },
  }
}

async function confirmarAccion() {
  await confirmar.value.accion()
  confirmar.value.visible = false
}

onMounted(cargar)
</script>

<template>
  <LoadingSpinner v-if="cargando" texto="Cargando equipo..." />

  <div v-else-if="noEncontrado" class="panel">
    <EmptyState icono="🔍" :mensaje="error">
      <RouterLink to="/equipos" class="btn">Volver a equipos</RouterLink>
    </EmptyState>
  </div>

  <template v-else-if="equipo">
    <div class="encabezado">
      <div>
        <RouterLink to="/equipos" class="texto-suave">← Equipos</RouterLink>
        <h1>{{ equipo.nombre }} <EstadoBadge :estado="equipo.estado" /></h1>
        <p class="texto-suave">{{ equipo.juegoPreferido }} · Capitán: {{ equipo.capitan.alias }}</p>
      </div>
      <div v-if="puedeGestionar" class="acciones">
        <button class="btn btn-sec" @click="editando = !editando">{{ editando ? 'Cancelar' : 'Editar' }}</button>
        <button class="btn btn-peligro" @click="eliminar">Eliminar</button>
      </div>
    </div>

    <AlertMessage v-if="exito" tipo="exito" :mensaje="exito" @cerrar="exito = ''" />
    <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

    <form v-if="editando" class="panel form-grid" @submit.prevent="guardar">
      <div class="campo"><label>Nombre</label><input v-model="form.nombre" /></div>
      <div class="campo"><label>Juego preferido</label><input v-model="form.juegoPreferido" /></div>
      <div class="campo">
        <label>Estado</label>
        <select v-model="form.estado">
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>
      <div><button class="btn">Guardar</button></div>
    </form>

    <div class="columnas">
      <section class="panel">
        <h2>Integrantes ({{ equipo.integrantes.length }})</h2>
        <ul class="lista">
          <li v-for="i in equipo.integrantes" :key="i.id">
            <span>
              <strong>{{ i.alias }}</strong> <span class="texto-suave">{{ i.nombre }}</span>
              <span v-if="i.id === equipo.capitanId" class="badge badge-ADMIN">Capitán</span>
            </span>
            <button v-if="puedeGestionar && i.id !== equipo.capitanId" class="btn btn-peligro btn-chico" @click="quitar(i)">
              Quitar
            </button>
          </li>
        </ul>
        <div v-if="puedeGestionar" class="agregar">
          <select v-model="nuevoIntegrante">
            <option value="">Agregar integrante...</option>
            <option v-for="u in usuariosDisponibles" :key="u.id" :value="u.id">{{ u.alias }} ({{ u.nombre }})</option>
          </select>
          <button class="btn" :disabled="!nuevoIntegrante" @click="agregar">Agregar</button>
        </div>
      </section>

      <section class="panel">
        <h2>Torneos</h2>
        <ul v-if="equipo.inscripciones.length" class="lista">
          <li v-for="insc in equipo.inscripciones" :key="insc.id">
            <span>
              <RouterLink :to="`/torneos/${insc.torneo.id}`">{{ insc.torneo.nombre }}</RouterLink>
              <small class="texto-suave"> · {{ fecha(insc.fecha) }}</small>
            </span>
            <EstadoBadge :estado="insc.estado" />
          </li>
        </ul>
        <EmptyState v-else icono="🏆" mensaje="El equipo no está inscrito en torneos." />
      </section>
    </div>

    <section class="panel">
      <h2>Partidos</h2>
      <PartidoItem v-for="p in partidos" :key="p.id" :partido="p" mostrar-torneo />
      <EmptyState v-if="!partidos.length" icono="📅" mensaje="Sin partidos." />
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
h1 .badge { vertical-align: middle; font-size: 0.8rem; }
.columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
.lista { list-style: none; padding: 0; margin: 0 0 1rem; }
.lista li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid var(--borde); }
.agregar { display: flex; gap: 0.5rem; }
.form-grid { align-items: end; }
</style>
