<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/auth'

const { usuario, estaAutenticado, esAdmin, cerrarSesion } = useAuth()
const router = useRouter()
const menuAbierto = ref(false)

function salir() {
  cerrarSesion()
  menuAbierto.value = false
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="navbar">
    <div class="nav-contenido">
      <RouterLink to="/" class="logo">🎮 GameHub <span>IPVG</span></RouterLink>

      <button class="hamburguesa" @click="menuAbierto = !menuAbierto" aria-label="Menú">☰</button>

      <!-- En móvil el menú se abre/cierra agregando la clase "abierto" -->
      <nav class="links" :class="{ abierto: menuAbierto }" @click="menuAbierto = false">
        <RouterLink to="/torneos">Torneos</RouterLink>
        <RouterLink to="/equipos">Equipos</RouterLink>
        <RouterLink to="/partidos">Partidos</RouterLink>

        <template v-if="estaAutenticado">
          <RouterLink to="/perfil" class="usuario">
            {{ usuario?.alias }}
            <span v-if="esAdmin" class="badge badge-ADMIN">ADMIN</span>
          </RouterLink>
          <button class="btn btn-sec btn-chico" @click="salir">Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Ingresar</RouterLink>
          <RouterLink to="/registro" class="btn btn-chico">Registrarse</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--panel);
  border-bottom: 1px solid var(--borde);
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-contenido {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.logo { font-weight: 800; font-size: 1.2rem; color: var(--texto); }
.logo span { color: var(--primario); }
.links { display: flex; align-items: center; gap: 1.1rem; }
.links a { color: var(--suave); font-weight: 600; }
.links a.router-link-active { color: var(--texto); }
.links a.btn { color: white; }
.usuario { display: inline-flex; gap: 0.4rem; align-items: center; }
.hamburguesa { display: none; background: none; border: none; color: var(--texto); font-size: 1.5rem; cursor: pointer; }

@media (max-width: 720px) {
  .hamburguesa { display: block; }
  .links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    background: var(--panel);
    border-bottom: 1px solid var(--borde);
    padding: 1rem;
  }
  .links.abierto { display: flex; }
}
</style>
