<script setup>
// Formulario para crear (/torneos/nuevo) o editar (/torneos/:id/editar) un torneo. Solo ADMIN.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const esEdicion = computed(() => !!props.id)

const form = ref({
  nombre: '',
  videojuego: '',
  modalidad: 'LIGA',
  descripcion: '',
  fechaInicio: '',
  cierreInscripcion: '',
  cupoMaximo: 8,
  estado: 'ABIERTO',
})
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const intentoEnviar = ref(false)

const errores = computed(() => {
  const f = form.value
  const e = {}
  if (f.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres'
  if (f.videojuego.trim().length < 2) e.videojuego = 'Indique el videojuego'
  if (!f.fechaInicio) e.fechaInicio = 'Indique la fecha de inicio'
  if (!f.cierreInscripcion) e.cierreInscripcion = 'Indique el cierre de inscripción'
  else if (f.fechaInicio && f.cierreInscripcion > f.fechaInicio)
    e.cierreInscripcion = 'El cierre debe ser antes o igual a la fecha de inicio'
  if (!Number.isInteger(f.cupoMaximo) || f.cupoMaximo < 2 || f.cupoMaximo > 64)
    e.cupoMaximo = 'El cupo debe ser un entero entre 2 y 64'
  return e
})

onMounted(async () => {
  if (!esEdicion.value) return
  cargando.value = true
  try {
    const t = await api.torneo(props.id)
    Object.keys(form.value).forEach((k) => (form.value[k] = t[k] ?? form.value[k]))
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  intentoEnviar.value = true
  error.value = ''
  if (Object.keys(errores.value).length) return
  guardando.value = true
  try {
    const t = esEdicion.value ? await api.editarTorneo(props.id, form.value) : await api.crearTorneo(form.value)
    router.push({ name: 'torneo-detalle', params: { id: t.id }, query: { ok: esEdicion.value ? 'editado' : 'creado' } })
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <h1>{{ esEdicion ? 'Editar torneo' : 'Nuevo torneo' }}</h1>
  <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />
  <LoadingSpinner v-if="cargando" />

  <form v-else class="panel" @submit.prevent="guardar" novalidate>
    <div class="form-grid">
      <div class="campo">
        <label>Nombre</label>
        <input v-model="form.nombre" :class="{ invalido: intentoEnviar && errores.nombre }" />
        <p v-if="intentoEnviar && errores.nombre" class="error-campo">{{ errores.nombre }}</p>
      </div>
      <div class="campo">
        <label>Videojuego</label>
        <input v-model="form.videojuego" placeholder="Valorant, Rocket League..."
          :class="{ invalido: intentoEnviar && errores.videojuego }" />
        <p v-if="intentoEnviar && errores.videojuego" class="error-campo">{{ errores.videojuego }}</p>
      </div>
      <div class="campo">
        <label>Modalidad</label>
        <select v-model="form.modalidad">
          <option value="LIGA">Liga (permite empates)</option>
          <option value="ELIMINACION">Eliminación directa (sin empates)</option>
        </select>
      </div>
      <div class="campo">
        <label>Estado</label>
        <select v-model="form.estado">
          <option value="ABIERTO">Inscripciones abiertas</option>
          <option value="EN_CURSO">En curso</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
      <div class="campo">
        <label>Cierre de inscripción</label>
        <input type="date" v-model="form.cierreInscripcion" :class="{ invalido: intentoEnviar && errores.cierreInscripcion }" />
        <p v-if="intentoEnviar && errores.cierreInscripcion" class="error-campo">{{ errores.cierreInscripcion }}</p>
      </div>
      <div class="campo">
        <label>Fecha de inicio</label>
        <input type="date" v-model="form.fechaInicio" :class="{ invalido: intentoEnviar && errores.fechaInicio }" />
        <p v-if="intentoEnviar && errores.fechaInicio" class="error-campo">{{ errores.fechaInicio }}</p>
      </div>
      <div class="campo">
        <label>Cupo máximo de equipos</label>
        <input type="number" v-model.number="form.cupoMaximo" min="2" max="64"
          :class="{ invalido: intentoEnviar && errores.cupoMaximo }" />
        <p v-if="intentoEnviar && errores.cupoMaximo" class="error-campo">{{ errores.cupoMaximo }}</p>
      </div>
    </div>
    <div class="campo">
      <label>Descripción</label>
      <textarea v-model="form.descripcion" rows="3"></textarea>
    </div>
    <div class="acciones">
      <button class="btn" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
      <button type="button" class="btn btn-sec" @click="router.back()">Cancelar</button>
    </div>
  </form>
</template>
