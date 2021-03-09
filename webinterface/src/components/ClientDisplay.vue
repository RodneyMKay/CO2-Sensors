<template>
  <h1>{{ client.name }}</h1>
</template>

<script>
import rest from "@/mixins/rest";

export default {
  name: "ClientDisplay",
  mixins: [rest],
  props: ["clientId"],
  data: () => ({
    client: {"name": "loading..."}
  }),
  created() {
    this.get(`/api/v1/clients/${this.clientId}`).then(client => {
      if (client !== undefined) {
        this.client = {"name": client.name};
        return client.name;
      }
    })
  }
}
</script>

<style scoped>

</style>
