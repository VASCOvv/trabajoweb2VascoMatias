<script setup>
defineProps({ texto: { type: String, default: 'Cargando...' } })
</script>

<template>
  <div class="carga">
    <span class="spinner"></span>
    <span>{{ texto }}</span>
  </div>
</template>

<style scoped>
.carga { display: flex; align-items: center; gap: 0.75rem; padding: 2rem; justify-content: center; color: var(--suave); }
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid var(--borde);
  border-top-color: var(--primario);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}
@keyframes girar { to { transform: rotate(360deg); } }
</style>
