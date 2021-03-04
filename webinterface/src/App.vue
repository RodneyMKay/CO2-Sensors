<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <SensorChooser v-bind:sensors="sensors"></SensorChooser>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import SensorChooser from "@/components/SensorChooser";

export default {
  name: 'App',
  components: {
    HelloWorld,
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
