<script setup>
// Diálogo de confirmación reutilizable (se usa antes de eliminar).
defineProps({
  visible: { type: Boolean, default: false },
  titulo: { type: String, default: '¿Está seguro?' },
  mensaje: { type: String, default: 'Esta acción no se puede deshacer.' },
  textoConfirmar: { type: String, default: 'Eliminar' },
  cargando: { type: Boolean, default: false },
})
const emit = defineEmits(['confirmar', 'cancelar'])
</script>

<template>
  <div v-if="visible" class="fondo" @click.self="emit('cancelar')">
    <div class="dialogo" role="dialog" aria-modal="true">
      <h2>{{ titulo }}</h2>
      <p class="texto-suave">{{ mensaje }}</p>
      <div class="acciones fin">
        <button class="btn btn-sec" @click="emit('cancelar')" :disabled="cargando">Cancelar</button>
        <button class="btn btn-peligro" @click="emit('confirmar')" :disabled="cargando">
          {{ cargando ? 'Procesando...' : textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fondo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
.dialogo {
  background: var(--panel);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
}
.fin { justify-content: flex-end; margin-top: 1rem; }
</style>
