<script setup>
import { ref } from 'vue'
const props = defineProps({
  title: String,
  startOpen: { type: Boolean, default: true },
})
const open = ref(props.startOpen)
</script>

<template>
  <section class="section" :class="{ collapsed: !open }">
    <header @click="open = !open">
      <h2>{{ title }}</h2>
      <span class="chev">{{ open ? '▾' : '▸' }}</span>
    </header>
    <div class="body">
      <slot />
    </div>
  </section>
</template>
