<template>
  <div class="sidebar">
    <Header />
    <Navigation>
      <NavigationItem @click="dataExpanded = !dataExpanded"><i class="bi-bar-chart-fill"></i> Sensordaten</NavigationItem>
      <Navigation v-if="dataExpanded">
        <NavigationItem small="true" v-for="client in clients" :key="client.id">{{ client.name }}</NavigationItem>
      </Navigation>
      <NavigationItem v-if="currentUser && (currentUser.permissions & 0x01) !== 0"><i class="bi-diagram-3-fill"></i> Clients</NavigationItem>
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
import rest from "@/mixins/rest";

export default {
  name: "Sidebar",
  mixins: [rest],
  components: {Navigation, NavigationItem, Header},
  data: () => ({
    dataExpanded: false,
    currentUser: null,
    clients: []
  }),
  methods: {
    login: function (username, password) {
      this.post("/api/v1/auth/login", {username: username, password: password}).then(data => {
        this.currentUser = data;
      });
    },
    logout: function () {
      this.post("/api/v1/auth/logout").then(() => {
        this.currentUser = null;
      });
    }
  },
  created() {
    this.get("/api/v1/clients").then(data => {
      this.clients = data;
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
