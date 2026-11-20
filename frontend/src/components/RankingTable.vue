<script setup>
// Tabla de posiciones. Recibe las filas ya calculadas por la API.
defineProps({ filas: { type: Array, required: true } })
</script>

<template>
  <div class="tabla-scroll">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Equipo</th>
          <th title="Partidos jugados">PJ</th>
          <th title="Victorias">V</th>
          <th title="Empates">E</th>
          <th title="Derrotas">D</th>
          <th title="A favor">AF</th>
          <th title="En contra">EC</th>
          <th title="Diferencia">DIF</th>
          <th>PTS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fila in filas" :key="fila.equipoId" :class="{ lider: fila.posicion === 1 && fila.puntos > 0 }">
          <td>{{ fila.posicion }}</td>
          <td>
            <RouterLink :to="`/equipos/${fila.equipoId}`">{{ fila.equipo }}</RouterLink>
          </td>
          <td>{{ fila.jugados }}</td>
          <td>{{ fila.victorias }}</td>
          <td>{{ fila.empates }}</td>
          <td>{{ fila.derrotas }}</td>
          <td>{{ fila.aFavor }}</td>
          <td>{{ fila.enContra }}</td>
          <td>{{ fila.diferencia > 0 ? '+' : '' }}{{ fila.diferencia }}</td>
          <td><strong>{{ fila.puntos }}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.lider td { background: rgba(124, 92, 255, 0.12); }
</style>
