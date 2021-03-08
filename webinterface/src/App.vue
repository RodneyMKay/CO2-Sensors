<template>
  <div id="app" class="d-flex">
    <Sidebar @client-selected="clientSelected($event)" />
    <div id="content" class="flex-fill">
      <div class="container">
        <ClientDisplay />
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
  components: {ClientDisplay, Sidebar },
  methods: {
    clientSelected: event => {
      console.log(event);
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
