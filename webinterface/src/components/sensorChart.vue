<script>
import rest from "@/mixins/rest"
import { Line, mixins } from 'vue-chartjs'
const {reactiveData} = mixins;

export default {
  name: "sensorChart",
  extends: Line,
  mixins: [reactiveData],
  props: {
    "sensor": {
      type: Object,
      required: true

    }, "options": {
      type: Object

    }, "update": {
      type: Boolean
    }
  },
  created() {

  },
  watch: {
    update: function (val, oldVal) {
      this.fillData()
    }
  },
  mounted () {
    this.fillData();
    this.renderChart(this.chartData, this.options);
  },
  methods: {
    fillData () {
      this.chartData = {
        labels: ["8Uhr", "9Uhr", "10Uhr", "11Uhr", "12Uhr", "13Uhr", "14Uhr", "15Uhr", "16Uhr"],
        datasets: [
          {
            label: "valueType" + this.sensor.valueType,
            backgroundColor: 'rgba(' + this.getRandomInt(100, 255) +  ', ' + this.getRandomInt(100, 255) +  ', ' + this.getRandomInt(100, 255) +  ')',
            data: [this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100), this.getRandomInt(0, 100)]
          }
        ]
      }
    },
    getRandomInt (start, end) {
      return Math.floor(Math.random() * (end-start)) + start
    }
  }
}
</script>