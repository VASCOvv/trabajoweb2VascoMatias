<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { guardarSesion } from '../services/auth'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const form = ref({ nombre: '', alias: '', correo: '', password: '', confirmar: '' })
const intentoEnviar = ref(false)
const cargando = ref(false)
const error = ref('')

const errores = computed(() => {
  const f = form.value
  const e = {}
  if (f.nombre.length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres'
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(f.alias)) e.alias = 'Alias de 3 a 50 caracteres (letras, números o _)'
  if (!/^\S+@\S+\.\S+$/.test(f.correo)) e.correo = 'Ingrese un correo válido'
  if (f.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
  if (f.confirmar !== f.password) e.confirmar = 'Las contraseñas no coinciden'
  return e
})

async function registrar() {
  intentoEnviar.value = true
  error.value = ''
  if (Object.keys(errores.value).length) return
  cargando.value = true
  try {
    const { confirmar, ...datos } = form.value
    const { access_token, usuario } = await api.register(datos)
    guardarSesion(access_token, usuario)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="auth panel">
    <h1>Crear cuenta</h1>
    <AlertMessage v-if="error" tipo="error" :mensaje="error" @cerrar="error = ''" />

    <form @submit.prevent="registrar" novalidate>
      <div class="campo" v-for="c in [
        { k: 'nombre', l: 'Nombre completo', t: 'text' },
        { k: 'alias', l: 'Alias (gamertag)', t: 'text' },
        { k: 'correo', l: 'Correo', t: 'email' },
        { k: 'password', l: 'Contraseña', t: 'password' },
        { k: 'confirmar', l: 'Repetir contraseña', t: 'password' },
      ]" :key="c.k">
        <label :for="c.k">{{ c.l }}</label>
        <input :id="c.k" v-model.trim="form[c.k]" :type="c.t" :class="{ invalido: intentoEnviar && errores[c.k] }" />
        <p v-if="intentoEnviar && errores[c.k]" class="error-campo">{{ errores[c.k] }}</p>
      </div>
      <button class="btn ancho" :disabled="cargando">{{ cargando ? 'Creando cuenta...' : 'Registrarme' }}</button>
    </form>
    <p class="texto-suave">¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink></p>
  </div>
</template>

<style scoped>
.auth { max-width: 460px; margin: 2rem auto; }
.ancho { width: 100%; justify-content: center; }
</style>
