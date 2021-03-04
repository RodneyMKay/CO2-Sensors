<template>
  <div class="SensorChooser">
    <select class="sensor-select" v-model="selected">
      <option>Bitte wählen sie einen Sensor</option>
      <option v-for="sensor in sensors"
              :key="sensor.id">
        {{ sensor.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "SensorChooser",
  props: {
    'sensors': Array

  }, methods: {}, data: function () {
    return {
      selected: "Bitte wählen sie einen Sensor"
    }

  }, watch: {
    selected: function (val, oldval) {
      oldval // TODO: remove
      //console.log("new selection: " + val);
      // window.location.pathname = "/test"
      this.$emit('selected', val);
    }

  }, created() {


  }
}
</script>

<style scoped>
.sensor-select {
/ / display: none;
}
</style>