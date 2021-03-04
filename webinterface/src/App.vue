<template>
  <div id="app">

    <SensorChooser v-bind:sensors="sensors"></SensorChooser>
  </div>
</template>

<script>
import SensorChooser from "@/components/SensorChooser";

export default {
  name: 'App',
  components: {
    SensorChooser
  }, data: function () {
    return {
      sensors: ['name', 'name2']
    }
  }
}

fetch("/api/sensors/list", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
    }
).then(response => response.json()).then(data => {
  console.log('Success:', data);
})

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
