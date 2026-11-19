<script setup>
import { computed } from 'vue'
import EstadoBadge from './EstadoBadge.vue'
import { ETIQUETAS, fecha } from '../services/formato'

const props = defineProps({ torneo: { type: Object, required: true } })
const emit = defineEmits(['ver'])

// computed: porcentaje de cupo ocupado para la barra
const porcentaje = computed(() =>
  Math.min(100, Math.round(((props.torneo.totalInscritos ?? 0) / props.torneo.cupoMaximo) * 100)),
)
</script>

<template>
  <article class="tarjeta panel" @click="emit('ver', torneo.id)">
    <div class="cabecera">
      <span class="juego">{{ torneo.videojuego }}</span>
      <EstadoBadge :estado="torneo.estado" />
    </div>
    <h3>{{ torneo.nombre }}</h3>
    <p class="texto-suave">
      {{ ETIQUETAS[torneo.modalidad] }} · Inicio {{ fecha(torneo.fechaInicio) }}
    </p>
    <div class="cupo">
      <div class="barra"><div class="relleno" :style="{ width: porcentaje + '%' }"></div></div>
      <small class="texto-suave">{{ torneo.totalInscritos ?? 0 }} / {{ torneo.cupoMaximo }} equipos</small>
    </div>
  </article>
</template>

<style scoped>
.tarjeta { cursor: pointer; margin: 0; transition: transform 0.15s, border-color 0.15s; }
.tarjeta:hover { transform: translateY(-2px); border-color: var(--primario); }
.cabecera { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.juego { color: var(--acento); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; }
h3 { margin: 0 0 0.25rem; }
.barra { height: 6px; background: var(--panel-2); border-radius: 999px; overflow: hidden; margin: 0.5rem 0 0.25rem; }
.relleno { height: 100%; background: linear-gradient(90deg, var(--primario), var(--acento)); }
</style>
