<script setup>
import { useConfig, makeHost } from '../stores/config.js'
import Section from './Section.vue'
import Field from './Field.vue'
import StringList from './StringList.vue'
import HostEditor from './HostEditor.vue'

const store = useConfig()
const a = store.agent

function addHost() {
  const n = a.hosts.length
  a.hosts.push(makeHost({ hostname: n < 3 ? `master-${n}` : `worker-${n - 3}`, role: n < 3 ? 'master' : 'worker' }))
}
function removeHost(i) { a.hosts.splice(i, 1) }
function duplicateHost(i) {
  const src = a.hosts[i]
  const clone = JSON.parse(JSON.stringify(src))
  clone.hostname = `${src.hostname}-copy`
  a.hosts.splice(i + 1, 0, clone)
}
</script>

<template>
  <div>
    <Section title="Agent identity & boot">
      <Field label="Cluster name" doc-key="agent.metadata.name"><input type="text" v-model="a.metadata.name" /></Field>
      <Field label="Rendezvous IP" doc-key="agent.rendezvousIP" help="Address of the node that coordinates the install. Must match one of the node IPs below and be in the machine network.">
        <input type="text" v-model="a.rendezvousIP" />
      </Field>
      <Field label="Boot artifacts base URL" doc-key="agent.bootArtifactsBaseURL" help="Optional. HTTP(S) URL where PXE boot artifacts are hosted.">
        <input type="text" v-model="a.bootArtifactsBaseURL" />
      </Field>
      <Field label="Minimal ISO" doc-key="agent.minimalISO" help="Emit minimalISO: true for a smaller ISO that streams rootfs over HTTP.">
        <input type="checkbox" v-model="a.minimalISO" />
      </Field>
      <Field label="Additional NTP sources" doc-key="agent.additionalNTPSources">
        <StringList v-model="a.additionalNTPSources" placeholder="0.rhel.pool.ntp.org" />
      </Field>
    </Section>

    <div class="section">
      <header style="cursor:default">
        <h2>Hosts ({{ a.hosts.length }})</h2>
        <button class="btn" @click="addHost" type="button">+ Add host</button>
      </header>
      <div class="body">
        <div v-for="(h, i) in a.hosts" :key="i" class="card">
          <header>
            <span class="title">{{ h.hostname || '(unnamed)' }} <span class="badge">{{ h.role }}</span></span>
            <div class="hstack">
              <button class="btn secondary" @click="duplicateHost(i)" type="button">Duplicate</button>
              <button class="btn danger" @click="removeHost(i)" type="button">Remove</button>
            </div>
          </header>
          <HostEditor :host="h" />
        </div>
      </div>
    </div>
  </div>
</template>
