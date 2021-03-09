<template>
  <ul class="navigation m-0 p-0">
    <slot></slot>
  </ul>
</template>

<script>
export default {
  name: "Navigation"
}
</script>

<style scoped>
.navigation {
  list-style-type: none;
}
</style>
