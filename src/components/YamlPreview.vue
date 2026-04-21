<script setup>
import { computed, ref } from 'vue'
import { useConfig } from '../stores/config.js'
import { buildInstallConfig, buildAgentConfig, parseYaml } from '../utils/yaml.js'

const store = useConfig()
const active = ref('install') // install | agent
const error = ref('')
const showImport = ref(false)
const importText = ref('')

const installYaml = computed(() => {
  try { error.value = ''; return buildInstallConfig(store.install) }
  catch (e) { error.value = String(e); return '' }
})
const agentYaml = computed(() => {
  try { error.value = ''; return buildAgentConfig(store.agent) }
  catch (e) { error.value = String(e); return '' }
})

const current = computed(() => active.value === 'install' ? installYaml.value : agentYaml.value)
const filename = computed(() => active.value === 'install' ? 'install-config.yaml' : 'agent-config.yaml')

function download() {
  const blob = new Blob([current.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.value
  a.click()
  URL.revokeObjectURL(url)
}

function copy() {
  navigator.clipboard.writeText(current.value)
}

async function downloadBoth() {
  // Simple tarball-less approach: two sequential downloads.
  const pairs = [
    ['install-config.yaml', installYaml.value],
    ['agent-config.yaml', agentYaml.value],
  ]
  for (const [name, body] of pairs) {
    const blob = new Blob([body], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    await new Promise((r) => setTimeout(r, 150))
  }
}

function applyImport() {
  try {
    const obj = parseYaml(importText.value)
    if (!obj || typeof obj !== 'object') throw new Error('not an object')
    if (active.value === 'install') loadInstall(obj)
    else loadAgent(obj)
    showImport.value = false
    importText.value = ''
    error.value = ''
  } catch (e) {
    error.value = `Import failed: ${e.message || e}`
  }
}

// Shallow load: merge known keys into store. Users can edit anything weird afterward.
function loadInstall(o) {
  const c = store.install
  if (o.baseDomain) c.baseDomain = o.baseDomain
  if (o.metadata?.name) c.metadata.name = o.metadata.name
  if (o.controlPlane) Object.assign(c.controlPlane, o.controlPlane)
  if (Array.isArray(o.compute)) c.compute = o.compute
  if (o.networking) {
    if (o.networking.networkType) c.networking.networkType = o.networking.networkType
    if (Array.isArray(o.networking.clusterNetwork)) c.networking.clusterNetwork = o.networking.clusterNetwork
    if (Array.isArray(o.networking.serviceNetwork)) c.networking.serviceNetwork = o.networking.serviceNetwork
    if (Array.isArray(o.networking.machineNetwork)) c.networking.machineNetwork = o.networking.machineNetwork
    if (o.networking.ovnKubernetesConfig) Object.assign(c.networking.ovnKubernetesConfig, o.networking.ovnKubernetesConfig)
  }
  if (o.platform?.none) { c.platformType = 'none' }
  else if (o.platform?.baremetal) {
    c.platformType = 'baremetal'
    Object.assign(c.platform.baremetal, o.platform.baremetal)
    c.platform.baremetal.includeHosts = Array.isArray(o.platform.baremetal.hosts) && o.platform.baremetal.hosts.length > 0
  }
  if (typeof o.fips === 'boolean') c.fips = o.fips
  if (o.cpuPartitioningMode) c.cpuPartitioningMode = o.cpuPartitioningMode
  if (o.publish) c.publish = o.publish
  if (o.proxy) { c.proxy.enabled = true; Object.assign(c.proxy, o.proxy) }
  if (o.additionalTrustBundle) c.additionalTrustBundle = o.additionalTrustBundle
  if (o.additionalTrustBundlePolicy) c.additionalTrustBundlePolicy = o.additionalTrustBundlePolicy
  if (Array.isArray(o.imageDigestSources)) c.imageDigestSources = o.imageDigestSources
  if (o.arbiter) { c.arbiter.enabled = true; Object.assign(c.arbiter, o.arbiter) }
  if (o.capabilities) { c.capabilities.enabled = true; Object.assign(c.capabilities, o.capabilities) }
  if (o.featureSet) c.featureSet = o.featureSet
  if (o.pullSecret) c.pullSecret = o.pullSecret
  if (o.sshKey) c.sshKey = o.sshKey
}

function loadAgent(o) {
  const a = store.agent
  if (o.metadata?.name) a.metadata.name = o.metadata.name
  if (o.rendezvousIP) a.rendezvousIP = o.rendezvousIP
  if (o.bootArtifactsBaseURL) a.bootArtifactsBaseURL = o.bootArtifactsBaseURL
  if (typeof o.minimalISO === 'boolean') a.minimalISO = o.minimalISO
  if (Array.isArray(o.additionalNTPSources)) a.additionalNTPSources = o.additionalNTPSources
  if (Array.isArray(o.hosts)) a.hosts = o.hosts.map(normalizeHost)
}

function normalizeHost(h) {
  // Ensure every expected subkey exists so the form bindings don't crash.
  return {
    hostname: h.hostname || '',
    role: h.role || 'worker',
    rootDeviceHints: {
      enabled: !!h.rootDeviceHints,
      deviceName: h.rootDeviceHints?.deviceName || '',
      hctl: h.rootDeviceHints?.hctl || '',
      model: h.rootDeviceHints?.model || '',
      vendor: h.rootDeviceHints?.vendor || '',
      serialNumber: h.rootDeviceHints?.serialNumber || '',
      minSizeGigabytes: h.rootDeviceHints?.minSizeGigabytes ?? null,
      wwn: h.rootDeviceHints?.wwn || '',
      wwnWithExtension: h.rootDeviceHints?.wwnWithExtension || '',
      wwnVendorExtension: h.rootDeviceHints?.wwnVendorExtension || '',
      rotational: h.rootDeviceHints?.rotational === true ? 'true' : h.rootDeviceHints?.rotational === false ? 'false' : 'any',
    },
    interfaces: Array.isArray(h.interfaces) ? h.interfaces : [],
    networkConfig: {
      interfaces: (h.networkConfig?.interfaces || []).map(normalizeIface),
      'dns-resolver': {
        config: {
          server: h.networkConfig?.['dns-resolver']?.config?.server || [],
          search: h.networkConfig?.['dns-resolver']?.config?.search || [],
        },
      },
      routes: { config: h.networkConfig?.routes?.config || [] },
    },
  }
}

function normalizeIface(i) {
  const t = i.type || 'ethernet'
  const out = {
    name: i.name || '',
    type: t,
    state: i.state || 'up',
    mtu: i.mtu ?? null,
    macAddress: i['mac-address'] || i.macAddress || '',
    ipv4: normIP(i.ipv4),
    ipv6: normIP(i.ipv6),
  }
  if (t === 'bond') {
    const la = i['link-aggregation'] || {}
    out['link-aggregation'] = {
      mode: la.mode || 'active-backup',
      options: la.options || { miimon: '100' },
      port: la.port || [],
    }
  }
  if (t === 'vlan') {
    out.vlan = { 'base-iface': i.vlan?.['base-iface'] || '', id: i.vlan?.id || 100 }
  }
  if (t === 'linux-bridge') {
    out.bridge = {
      options: { stp: { enabled: !!i.bridge?.options?.stp?.enabled } },
      port: i.bridge?.port || [],
    }
  }
  return out
}

function normIP(ip) {
  if (!ip) return { enabled: false, dhcp: false, autoconf: false, address: [] }
  return {
    enabled: !!ip.enabled,
    dhcp: !!ip.dhcp,
    autoconf: !!ip.autoconf,
    address: ip.address || [],
  }
}

function resetActive() {
  if (!confirm(`Reset the ${active.value === 'install' ? 'install-config' : 'agent-config'} form to defaults?`)) return
  if (active.value === 'install') store.resetInstall()
  else store.resetAgent()
}
</script>

<template>
  <div>
    <div class="preview-tabs">
      <button :class="{ active: active === 'install' }" @click="active = 'install'">install-config.yaml</button>
      <button :class="{ active: active === 'agent' }" @click="active = 'agent'">agent-config.yaml</button>
    </div>
    <div class="toolbar" style="margin-bottom:8px">
      <button class="btn" @click="download" type="button">⬇ Download {{ filename }}</button>
      <button class="btn secondary" @click="downloadBoth" type="button">⬇ Download both</button>
      <button class="btn secondary" @click="copy" type="button">Copy</button>
      <button class="btn secondary" @click="showImport = !showImport" type="button">{{ showImport ? 'Cancel import' : 'Import YAML' }}</button>
      <button class="btn danger" @click="resetActive" type="button">Reset</button>
    </div>
    <div v-if="showImport" class="card">
      <header><span class="title">Paste YAML to import into the {{ active }} form</span></header>
      <textarea v-model="importText" style="min-height:160px; width:100%"></textarea>
      <div class="toolbar" style="margin-top:8px">
        <button class="btn" @click="applyImport" type="button">Apply</button>
      </div>
    </div>
    <div v-if="error" class="err">{{ error }}</div>
    <pre class="yaml">{{ current }}</pre>
  </div>
</template>
