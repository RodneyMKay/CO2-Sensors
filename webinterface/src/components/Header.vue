<template>
  <div class="header text-white">
    <img src="@/assets/logo.png" alt="">
    <p>Friedrich-List-Schule</p>
    <p>CO₂-Sensoren</p>
  </div>
</template>

<script>
export default {
  name: "Header"
}
</script>

<style scoped>
.header {
  background-color: #0a538f;
  padding: 10px 10px 10px 10px;
  height: 70px;
  box-shadow: 0 5px 5px -5px #222;
  margin-bottom: 20px;
}

.header img {
  float: left;
  width: 50px;
  height: 50px;
}

.header p {
  float: left;
  margin: 0 0 0 20px;
}
</style>
