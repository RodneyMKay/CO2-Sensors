<script>
import rest from "@/mixins/rest"
import { Line, mixins } from 'vue-chartjs'
import constants from "@/constants"
const {reactiveData} = mixins;

export default {
  name: "sensorChart",
  extends: Line,
  mixins: [reactiveData, rest],
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
      val
      oldVal
      //this.fillData()
      this.updateCharts(Date.now()-0.5*60*60*1000, Date.now())
    }
  },
  mounted () {
    this.updateCharts(Date.now()-0.5*60*60*1000, Date.now());

    // add scaling for charts
    let min = null;
    let max = null;
    let unit = "";
    if (this.sensor.valueType === 0) {
      min = 300;
      max = 1500;
      unit = "ppm";
    } else if (this.sensor.valueType === 1) {
      min = 0;
      max = 100;
      unit = "none";
    } else if (this.sensor.valueType === 2) {
      min = 0;
      max = 100;
      unit = "IAQ";
    } else if (this.sensor.valueType === 3) {
      min = 0;
      max = 100;
      unit = "°C";
    } else if (this.sensor.valueType === 4) {
      min = 0;
      max = 100;
      unit = "%";
    } else if (this.sensor.valueType === 5) {
      min = 900;
      max = 1100;
      unit = "hPa";
    } else if (this.sensor.valueType === 6) {
      min = 0;
      max = 10000;
    } else if (this.sensor.valueType === 7) {
      min = 300;
      max = 1500;
      unit = "ppm";
    }
    if (min!== null && max !== null) {
      if (unit !== "") {
        unit
      }
      this.options = {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: min,
              suggestedMax: max
            }
          }]
        }
      }
    }
    this.renderChart(this.chartData, this.options);
  },
  methods: {
    // in milliseconds
    updateCharts(startTimestamp, endTimestamp) {
      let labels = []
      let values = []

      this.get(`/api/v1/sensors/${this.sensor.id}/data?from=${startTimestamp}&to=${endTimestamp}`).then(data => {
        for (let i = 0; i < data.length; i++) {
          labels.push(data[i].time)
          values.push(data[i].value)
        }

        let label = constants.valueTypes[this.sensor.valueType]
        if (label === undefined) label = "unknown valueType"

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: label,
              backgroundColor: 'rgba(' + this.getRandomInt(100, 255) +  ', ' + this.getRandomInt(100, 255) +  ', ' + this.getRandomInt(100, 255) +  ')',
              data: values
            }
          ]
        }
      })
    },
    getRandomInt (start, end) {
      return Math.floor(Math.random() * (end-start)) + start
    }
  }
}
</script>
