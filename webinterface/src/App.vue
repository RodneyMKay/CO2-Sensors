<template>
  <div id="app">
    <ClientChooser v-bind:sensors="sensors" @selected="selectHandler"></ClientChooser>
  </div>
</template>

<script>
import ClientChooser from "@/components/ClientChooser";

export default {
  name: 'App',
  components: {
    ClientChooser
  }, data: function () {
    return {
      sensors: ['loading']
    }

  }, methods: {
    selectHandler (value) {
      console.log("selected " + value);

    }
  }, created() {
    fetch("/api/sensors/list", {
          method: "POST"
        }
    ).then(response => response.json()).then(data => {
      this.sensors = data;
    })
  }
}

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
