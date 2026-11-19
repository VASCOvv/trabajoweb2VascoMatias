<script setup>
import EstadoBadge from './EstadoBadge.vue'
import { fechaHora } from '../services/formato'

defineProps({
  partido: { type: Object, required: true },
  mostrarTorneo: { type: Boolean, default: false },
})
</script>

<template>
  <RouterLink :to="`/partidos/${partido.id}`" class="partido">
    <div class="meta">
      <small class="texto-suave">
        <template v-if="mostrarTorneo">{{ partido.torneo?.nombre }} · </template>
        {{ partido.ronda }} · {{ fechaHora(partido.fechaHora) }}
      </small>
      <EstadoBadge :estado="partido.estado" />
    </div>
    <div class="marcador">
      <span class="equipo">{{ partido.equipoLocal?.nombre }}</span>
      <span class="score" v-if="partido.resultado">
        {{ partido.resultado.puntajeLocal }} - {{ partido.resultado.puntajeVisitante }}
      </span>
      <span class="score vs" v-else>vs</span>
      <span class="equipo der">{{ partido.equipoVisitante?.nombre }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.partido {
  display: block;
  background: var(--panel-2);
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--texto);
  margin-bottom: 0.6rem;
}
.partido:hover { border-color: var(--primario); text-decoration: none; }
.meta { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.marcador { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; margin-top: 0.35rem; }
.equipo { font-weight: 700; }
.der { text-align: right; }
.score { font-size: 1.2rem; font-weight: 800; color: var(--acento); }
.vs { color: var(--suave); font-size: 0.95rem; }
</style>
