<template>
  <div id="app">
    <ClientChooser v-if="showClientChooser" v-bind:sensors="sensors" @selected="selectHandler"></ClientChooser>
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
      sensors: ['loading'],
      showClientChooser: true
    }

  }, methods: {
    selectHandler(value) {
      console.log("selected " + value);
      this.showClientChooser = false;
    }
  }, created() {
    fetch("/api/clients/list", {
          method: "POST"
        }
    ).then(response => {
      if (response.ok) {
        response.json().then( data => {
          this.sensors = data;
        })
      }
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
