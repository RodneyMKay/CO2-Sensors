<template>
  <div class="sidebar">
    <Header />
    <Navigation>
      <NavigationItem><i class="bi-house-door-fill"></i> Dashboard</NavigationItem>
      <NavigationItem @click="dataExpanded = !dataExpanded"><i class="bi-bar-chart-fill"></i> Sensordaten</NavigationItem>
      <Navigation v-if="dataExpanded">
        <NavigationItem small="true" v-for="client in clients" :key="client.id">{{ client.name }}</NavigationItem>
      </Navigation>
      <NavigationItem v-if="currentUser && (currentUser.permissions & 0x04) !== 0"><i class="bi-people-fill"></i> Nutzer</NavigationItem>
      <NavigationItem v-if="currentUser && (currentUser.permissions & 0x08) !== 0"><i class="bi-gear-fill"></i> Einstellungen</NavigationItem>
      <NavigationItem v-if="!currentUser" @click="login('test', 'test')"><i class="bi-person-fill"></i> Login</NavigationItem>
      <NavigationItem v-if="currentUser" @click="logout"><i class="bi-door-open-fill"></i> Logout</NavigationItem>
    </Navigation>
  </div>
</template>

<script>
import Header from "@/components/Header";
import NavigationItem from "@/components/NavigationItem";
import Navigation from "@/components/Navigation";
export default {
  name: "Sidebar",
  components: {Navigation, NavigationItem, Header},
  data: () => ({
    dataExpanded: false,
    currentUser: null,
    clients: []
  }),
  methods: {
    login: function (username, password) {
      fetch("/api/v1/auth/login", { method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: username, password: password}) }).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.currentUser = data;
          });
        }
      });
    },
    logout: function () {
      fetch("/api/v1/auth/logout", { method: "POST" }).then(response => {
        if (response.ok) {
          response.json().then(() => {
            this.currentUser = null;
          });
        }
      });
    }
  },
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
.sidebar {
  width: 250px;
  background-color: #093962;
  z-index: 100;
  box-shadow: 0 0 5px #222;
}
</style>