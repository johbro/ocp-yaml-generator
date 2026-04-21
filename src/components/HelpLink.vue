<script setup>
import { computed } from 'vue'
import { docUrl } from '../utils/docs.js'

const props = defineProps({
  docKey: { type: String, default: '' },
  label: { type: String, default: '' },
})

const url = computed(() => (props.docKey ? docUrl(props.docKey) : null))
const title = computed(() => {
  const base = props.label ? `Docs for ${props.label}` : 'Schema docs'
  return props.docKey ? `${base} (${props.docKey})` : base
})
</script>

<template>
  <a
    v-if="url"
    class="helplink"
    :href="url"
    :title="title"
    target="_blank"
    rel="noopener noreferrer"
    @click.stop
  >?</a>
</template>

<style scoped>
.helplink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  text-decoration: none;
  line-height: 1;
  margin-left: 6px;
  vertical-align: middle;
  cursor: help;
  flex-shrink: 0;
}
.helplink:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
