<template>
  <article>
    <h1>Sensor {{ client.name }}</h1>
    <section v-on:click="triggerUpdate" v-if="sensors" class="tables">
      <article class="sensorchart" v-for="sensor in sensors" v-bind:key="sensor.id">
        <sensor-chart v-bind:update="updateChartsFlag" v-bind:sensor="sensor"></sensor-chart>
      </article>
    </section>
    <section v-else>
      <p>hier gibts keine Charts</p>
    </section>

    <table v-if="sensors">
      <tr><th>id</th><th>sensorId</th><th>sensorType</th><th>valueType</th></tr>
      <tr v-for="sensor in sensors" v-bind:key="sensor.id">
        <td>{{sensor.id}}</td>
        <td>{{sensor.clientId}}</td>
        <td>{{sensor.sensorType}}</td>
        <td>{{sensor.valueType}}</td>
      </tr>
    </table>
  </article>
</template>

<script>
import rest from "@/mixins/rest";
import sensorChart from "@/components/sensorChart";

export default {
  name: "ClientDisplay",
  components: {
    sensorChart
  },
  mixins: [rest],
  props: ["clientId"],

  data: () => ({
    client: {"name": "name loading...", "mqttId": null, "id": null},
    sensors: null,
    updateChartsFlag: true
  }),
  created() {
    this.get(`/api/v1/clients/${this.clientId}`).then(client => {
      if (client !== undefined) {
        this.client = client;
      }
    });

    this.get(`/api/v1/clients/${this.clientId}/sensors`).then(sensors => {
      this.sensors = sensors;
    });
  },
  watch: {
    clientId: function (val, oldVal) {
      oldVal
      this.get(`/api/v1/clients/${val}`).then(client => {
        if (client !== undefined) {
          this.client = client;
        }
      });

      this.get(`/api/v1/clients/${val}/sensors`).then(sensors => {
        this.sensors = sensors;
      });
    }
  }, methods: {
    triggerUpdate () {
      this.updateChartsFlag = !this.updateChartsFlag;
    }
  }
}
</script>

<style scoped>
table {
  border: 1px solid black;
}
th {
  border: 1px solid black;
}
tr {
  border: 1px solid black;
}
td {
  border: 1px solid black;
}
.sensorchart {
  width: 30em;
  display: inline-flex;
}
</style>
