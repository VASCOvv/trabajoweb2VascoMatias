import { createRouter, createWebHistory } from 'vue-router'
import { esAdmin, estaAutenticado } from '../services/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PerfilView from '../views/PerfilView.vue'
import EquiposView from '../views/EquiposView.vue'
import EquipoDetalleView from '../views/EquipoDetalleView.vue'
import TorneosView from '../views/TorneosView.vue'
import TorneoDetalleView from '../views/TorneoDetalleView.vue'
import TorneoFormView from '../views/TorneoFormView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView, meta: { soloInvitados: true } },
  { path: '/registro', name: 'registro', component: RegisterView, meta: { soloInvitados: true } },
  { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiereAuth: true } },

  { path: '/equipos', name: 'equipos', component: EquiposView },
  // Ruta dinámica: :id se recibe como prop en la vista
  { path: '/equipos/:id', name: 'equipo-detalle', component: EquipoDetalleView, props: true },

  // Rutas de torneos
{ path: '/torneos', name: 'torneos', component: TorneosView },

{ path: '/torneos/nuevo', name: 'torneo-nuevo', component: TorneoFormView, meta: { requiereAuth: true, rol: 'ADMIN' } },

{ path: '/torneos/:id/editar', name: 'torneo-editar', component: TorneoFormView, props: true, meta: { requiereAuth: true, rol: 'ADMIN' } },

{ path: '/torneos/:id', name: 'torneo-detalle', component: TorneoDetalleView, props: true },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Protección de navegación según autenticación y rol.
router.beforeEach((to) => {
  if (to.meta.requiereAuth && !estaAutenticado.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.rol === 'ADMIN' && !esAdmin.value) {
    return { name: 'home', query: { aviso: 'sin-permiso' } }
  }
  if (to.meta.soloInvitados && estaAutenticado.value) {
    return { name: 'home' }
  }
})

export default router
