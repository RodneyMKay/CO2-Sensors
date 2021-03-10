<template>
  <div id="app" class="d-flex">
    <Sidebar @changeClientDisplay="clientId = $event" />
    <div id="content" class="flex-fill">
      <div class="container">
        <ClientDisplay v-bind:client-id="clientId"/>
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from "@/components/Sidebar";
import ClientDisplay from "@/components/ClientDisplay";

export default {
  name: 'App',
  components: {ClientDisplay, Sidebar},
  data() {
    return {
      clientId: "3"
    }
  },
  methods: {
    clientSelected: data => {
      console.log("Changing to client" + data);
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
}

#content {
  background-color: #a7d4ff;
}
</style>
