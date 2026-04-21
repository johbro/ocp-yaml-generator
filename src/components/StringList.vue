<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function update(i, v) {
  const next = [...props.modelValue]
  next[i] = v
  emit('update:modelValue', next)
}
function add() { emit('update:modelValue', [...props.modelValue, '']) }
function remove(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="vstack">
    <div v-for="(item, i) in modelValue" :key="i" class="hstack">
      <input type="text" :value="item" :placeholder="placeholder" @input="update(i, $event.target.value)" />
      <button class="btn secondary" @click="remove(i)" type="button">✕</button>
    </div>
    <button class="btn ghost" @click="add" type="button">+ Add</button>
  </div>
</template>
