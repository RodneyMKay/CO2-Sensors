<template>
  <ul class="client-list m-0 p-0">
    <li v-for="client in clients" :key="client.id" @click="$emit('client-selected', client.id)">{{client.name}}</li>
  </ul>
</template>

<script>
export default {
  name: "ClientSelector",
  data: () => ({
    clients: []
  }),
  created() {
    fetch("/api/v1/clients/", { method: "GET" }).then(response => {
      if (response.ok) {
        response.json().then(data => {
          this.clients = data;
        });
      }
    });
  }
}
</script>

<style scoped>
.client-list {
  list-style-type: none;
}

.client-list li {
  padding: 10px 10px 10px 30px;
  color: #fff;
  transition: color .5s;
  cursor: pointer;
  height: 60px;
  font-size: 1.5rem;
  vertical-align: center;
}

.client-list li:hover {
  color: #92d002;
}
</style>