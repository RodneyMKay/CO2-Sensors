<template>
  <div class="SensorChooser">
    <select name="Sensors" >
      <option v-for="sensor in sensors"
              :key="sensor">
        {{sensor}}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "SensorChooser",
  props: {
    'sensors': Array
  }
}
</script>

<style scoped>

</style>