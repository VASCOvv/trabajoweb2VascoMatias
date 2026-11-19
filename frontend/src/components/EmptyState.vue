<script setup>
defineProps({
  icono: { type: String, default: '🕹️' },
  mensaje: { type: String, default: 'No hay registros para mostrar.' },
})
</script>

<template>
  <div class="vacio">
    <div class="icono">{{ icono }}</div>
    <p>{{ mensaje }}</p>
    <slot />
  </div>
</template>

<style scoped>
.vacio { text-align: center; padding: 2.5rem 1rem; color: var(--suave); }
.icono { font-size: 2.5rem; }
</style>
