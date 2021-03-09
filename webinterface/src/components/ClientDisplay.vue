<template>
  <article>
    <h1>Sensor {{ client.name }}</h1>

  </article>
</template>

<script>
import rest from "@/mixins/rest";

export default {
  name: "ClientDisplay",
  mixins: [rest],
  props: ["clientId"],
  data: () => ({
    client: {"name": "name loading..."}
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
