<script setup>
import { ref } from 'vue'
import HelpLink from './HelpLink.vue'
const props = defineProps({
  title: String,
  startOpen: { type: Boolean, default: true },
  docKey: { type: String, default: '' },
})
const open = ref(props.startOpen)
</script>

<template>
  <section class="section" :class="{ collapsed: !open }">
    <header @click="open = !open">
      <h2>
        <span>{{ title }}</span>
        <HelpLink v-if="docKey" :doc-key="docKey" :label="title" />
      </h2>
      <span class="chev">{{ open ? '▾' : '▸' }}</span>
    </header>
    <div class="body">
      <slot />
    </div>
  </section>
</template>
