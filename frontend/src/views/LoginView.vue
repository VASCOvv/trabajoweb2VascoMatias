<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { guardarSesion } from '../services/auth'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const route = useRoute()

const form = ref({ correo: '', password: '' })
const intentoEnviar = ref(false)
const cargando = ref(false)
const error = ref('')

// Validación en el cliente antes de enviar
const errores = computed(() => {
  const e = {}
  if (!/^\S+@\S+\.\S+$/.test(form.value.correo)) e.correo = 'Ingrese un correo válido'
  if (!form.value.password) e.password = 'Ingrese su contraseña'
  return e
})
const esValido = computed(() => Object.keys(errores.value).length === 0)

async function ingresar() {
  intentoEnviar.value = true
  error.value = ''
  if (!esValido.value) return

  cargando.value = true
  try {
    const { access_token, usuario } = await api.login(form.value)
    guardarSesion(access_token, usuario)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="auth panel">
    <h1>Iniciar sesión</h1>
    <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

    <form @submit.prevent="ingresar" novalidate>
      <div class="campo">
        <label for="correo">Correo</label>
        <input id="correo" v-model.trim="form.correo" type="email" placeholder="usuario@ipvg.cl"
          :class="{ invalido: intentoEnviar && errores.correo }" />
        <p v-if="intentoEnviar && errores.correo" class="error-campo">{{ errores.correo }}</p>
      </div>
      <div class="campo">
        <label for="password">Contraseña</label>
        <input id="password" v-model="form.password" type="password"
          :class="{ invalido: intentoEnviar && errores.password }" />
        <p v-if="intentoEnviar && errores.password" class="error-campo">{{ errores.password }}</p>
      </div>
      <button class="btn ancho" :disabled="cargando">{{ cargando ? 'Ingresando...' : 'Ingresar' }}</button>
    </form>
    <p class="texto-suave">¿No tienes cuenta? <RouterLink to="/registro">Regístrate</RouterLink></p>
  </div>
</template>

<style scoped>
.auth { max-width: 420px; margin: 2rem auto; }
.ancho { width: 100%; justify-content: center; }
</style>
