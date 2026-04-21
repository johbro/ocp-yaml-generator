<script setup>
defineProps({
  label: String,
  help: String,
})
</script>

<template>
  <div class="row">
    <label>{{ label }}</label>
    <div>
      <slot />
      <div v-if="help" class="help">{{ help }}</div>
    </div>
  </div>
</template>
