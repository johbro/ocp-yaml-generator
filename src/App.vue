<script setup>
import { ref } from 'vue'
import InstallConfigForm from './components/InstallConfigForm.vue'
import AgentConfigForm from './components/AgentConfigForm.vue'
import YamlPreview from './components/YamlPreview.vue'

const activeForm = ref('install') // install | agent
</script>

<template>
  <div class="app">
    <header>
      <h1>OCP YAML Generator <span class="badge">4.18+</span></h1>
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
