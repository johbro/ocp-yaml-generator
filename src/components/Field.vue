<script setup>
import HelpLink from './HelpLink.vue'
defineProps({
  label: String,
  help: String,
  docKey: { type: String, default: '' },
})
</script>

<template>
  <div class="row">
    <label>
      <span>{{ label }}</span>
      <HelpLink v-if="docKey" :doc-key="docKey" :label="label" />
    </label>
    <div>
      <slot />
      <div v-if="help" class="help">{{ help }}</div>
    </div>
  </div>
</template>
