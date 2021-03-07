<template>
  <div class="sidebar">
    <Header />
    <ClientSelector @client-selected="$emit('client-selected', $event)" />
  </div>
</template>

<script>
import Header from "@/components/Header";
import ClientSelector from "@/components/ClientSelector";
export default {
  name: "Sidebar",
  components: {ClientSelector, Header}
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #093962;
  z-index: 100;
  box-shadow: 0 0 5px #222;
}
</style>