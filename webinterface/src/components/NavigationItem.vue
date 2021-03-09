<template>
  <li class="navigation-item" @click="$emit('click', $event)" v-bind:class="{ 'small': small, 'active': active }"><slot></slot></li>
</template>

<script>
export default {
  name: "NavigationItem",
  props: ["small", "active"]
}
</script>

<style scoped>
.navigation-item {
  padding: 10px 10px 10px 30px;
  color: #fff;
  transition: color .5s;
  cursor: pointer;
  height: 60px;
  font-size: 1.5rem;
  vertical-align: center;
}

.small {
  font-size: 1rem;
  height: 45px;
  padding-left: 70px;
}

.active {
  color: #92d002;
}

.navigation-item:hover {
  color: #92d002;
}
</style>
