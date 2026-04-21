<script setup>
import { ref } from 'vue'
import InstallConfigForm from './components/InstallConfigForm.vue'
import AgentConfigForm from './components/AgentConfigForm.vue'
import YamlPreview from './components/YamlPreview.vue'
import { ocpVersion, ocpVersionOptions } from './utils/docs.js'

const activeForm = ref('install') // install | agent
</script>

<template>
  <div class="app">
    <header>
      <h1>
        OCP YAML Generator
        <label class="version-picker" title="OCP version for doc links">
          <select v-model="ocpVersion">
            <option v-for="v in ocpVersionOptions" :key="v" :value="v">{{ v }}</option>
          </select>
        </label>
      </h1>
      <div class="tabs">
        <button :class="{ active: activeForm === 'install' }" @click="activeForm = 'install'">install-config</button>
        <button :class="{ active: activeForm === 'agent' }" @click="activeForm = 'agent'">agent-config</button>
      </div>
    </header>
    <div class="form-pane">
      <InstallConfigForm v-show="activeForm === 'install'" />
      <AgentConfigForm v-show="activeForm === 'agent'" />
    </div>
    <div class="preview-pane">
      <YamlPreview />
    </div>
  </div>
</template>

<style scoped>
.version-picker {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
}
.version-picker select {
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: inherit;
}
</style>
