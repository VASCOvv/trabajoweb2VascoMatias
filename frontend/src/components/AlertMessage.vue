<script setup>
// Mensaje de éxito / error / aviso reutilizable.
// Props: tipo y mensaje. Emit: 'cerrar' cuando el usuario lo cierra.
defineProps({
  tipo: { type: String, default: 'info' }, // 'exito' | 'error' | 'aviso' | 'info'
  mensaje: { type: String, required: true },
})
const emit = defineEmits(['cerrar'])
</script>

<template>
  <div class="alerta" :class="tipo" role="alert">
    <span>{{ mensaje }}</span>
    <button class="cerrar" @click="emit('cerrar')" aria-label="Cerrar">×</button>
  </div>
</template>

<style scoped>
.alerta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid;
}
.exito { background: rgba(34, 197, 94, 0.12); border-color: var(--ok); }
.error { background: rgba(239, 68, 68, 0.12); border-color: var(--error); }
.aviso { background: rgba(245, 158, 11, 0.12); border-color: var(--aviso); }
.info { background: rgba(34, 211, 238, 0.1); border-color: var(--acento); }
.cerrar { background: none; border: none; color: inherit; font-size: 1.3rem; cursor: pointer; line-height: 1; }
</style>
