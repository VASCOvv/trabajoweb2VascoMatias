<script setup>
import { computed } from 'vue'
import { ETIQUETAS } from '../services/formato'

const props = defineProps({ estado: { type: String, required: true } })
const etiqueta = computed(() => ETIQUETAS[props.estado] ?? props.estado)
</script>

<template>
  <span class="badge" :class="`badge-${estado}`">{{ etiqueta }}</span>
</template>
