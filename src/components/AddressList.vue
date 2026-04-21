<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  family: { type: String, default: 'ipv4' }, // ipv4 | ipv6
})
const emit = defineEmits(['update:modelValue'])

function addAddr() {
  const next = [...props.modelValue, { ip: '', 'prefix-length': props.family === 'ipv6' ? 64 : 24 }]
  emit('update:modelValue', next)
}
function removeAddr(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}
function update(i, key, val) {
  const next = props.modelValue.map((a, idx) => idx === i ? { ...a, [key]: val } : a)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="vstack">
    <div v-for="(a, i) in modelValue" :key="i" class="hstack">
      <input type="text" :value="a.ip" :placeholder="family === 'ipv6' ? 'fd00::1' : '192.168.1.10'" @input="update(i, 'ip', $event.target.value)" style="flex:2" />
      <span class="muted">/</span>
      <input type="number" :value="a['prefix-length']" @input="update(i, 'prefix-length', Number($event.target.value))" style="flex:1; max-width:80px" />
      <button class="btn secondary" @click="removeAddr(i)" type="button">✕</button>
    </div>
    <button class="btn ghost" @click="addAddr" type="button">+ Add address</button>
  </div>
</template>
