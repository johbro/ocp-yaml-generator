<script setup>
import { useConfig, hyperthreadingOptions, architectureOptions, networkTypeOptions, publishOptions, featureSetOptions, baselineCapabilityOptions, additionalCapabilityOptions, trustBundlePolicyOptions, cpuPartitioningOptions, platformTypeOptions, diskEncryptionTypes } from '../stores/config.js'
import Section from './Section.vue'
import Field from './Field.vue'
import StringList from './StringList.vue'

const store = useConfig()
const c = store.install

function addCompute() {
  c.compute.push({ name: `worker-${c.compute.length}`, replicas: 1, hyperthreading: 'Enabled', architecture: 'amd64' })
}
function removeCompute(i) { c.compute.splice(i, 1) }

function addClusterNet() { c.networking.clusterNetwork.push({ cidr: '10.128.0.0/14', hostPrefix: 23 }) }
function removeClusterNet(i) { c.networking.clusterNetwork.splice(i, 1) }
function addMachineNet() { c.networking.machineNetwork.push({ cidr: '' }) }
function removeMachineNet(i) { c.networking.machineNetwork.splice(i, 1) }

function addDigestSource() { c.imageDigestSources.push({ source: '', mirrors: [''] }) }
function removeDigestSource(i) { c.imageDigestSources.splice(i, 1) }

function toggleCapability(cap) {
  const arr = c.capabilities.additionalEnabledCapabilities
  const idx = arr.indexOf(cap)
  if (idx === -1) arr.push(cap)
  else arr.splice(idx, 1)
}

function addTangServer() { c.diskEncryption.tang.push({ url: '', thumbprint: '' }) }
function removeTangServer(i) { c.diskEncryption.tang.splice(i, 1) }
</script>

<template>
  <div>
    <Section title="Cluster identity">
      <Field label="Cluster name"><input type="text" v-model="c.metadata.name" /></Field>
      <Field label="Base domain"><input type="text" v-model="c.baseDomain" /></Field>
      <Field label="Publish strategy">
        <select v-model="c.publish">
          <option v-for="o in publishOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
      <Field label="FIPS mode"><input type="checkbox" v-model="c.fips" /></Field>
      <Field label="CPU partitioning">
        <select v-model="c.cpuPartitioningMode">
          <option v-for="o in cpuPartitioningOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
      <Field label="Feature set">
        <select v-model="c.featureSet">
          <option v-for="o in featureSetOptions" :key="o" :value="o">{{ o || '(default)' }}</option>
        </select>
      </Field>
    </Section>

    <Section title="Control plane">
      <Field label="Pool name"><input type="text" v-model="c.controlPlane.name" /></Field>
      <Field label="Replicas"><input type="number" min="1" v-model.number="c.controlPlane.replicas" /></Field>
      <Field label="Hyperthreading">
        <select v-model="c.controlPlane.hyperthreading">
          <option v-for="o in hyperthreadingOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
      <Field label="Architecture">
        <select v-model="c.controlPlane.architecture">
          <option v-for="o in architectureOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
    </Section>

    <Section title="Compute pools">
      <div v-for="(p, i) in c.compute" :key="i" class="card">
        <header>
          <span class="title">{{ p.name || `pool-${i}` }}</span>
          <button class="btn danger" @click="removeCompute(i)" type="button">Remove</button>
        </header>
        <div class="grid-2">
          <Field label="Name"><input type="text" v-model="p.name" /></Field>
          <Field label="Replicas"><input type="number" min="0" v-model.number="p.replicas" /></Field>
          <Field label="Hyperthreading">
            <select v-model="p.hyperthreading">
              <option v-for="o in hyperthreadingOptions" :key="o" :value="o">{{ o }}</option>
            </select>
          </Field>
          <Field label="Architecture">
            <select v-model="p.architecture">
              <option v-for="o in architectureOptions" :key="o" :value="o">{{ o }}</option>
            </select>
          </Field>
        </div>
      </div>
      <button class="btn ghost" @click="addCompute" type="button">+ Add compute pool</button>
    </Section>

    <Section title="Networking">
      <Field label="Network type">
        <select v-model="c.networking.networkType">
          <option v-for="o in networkTypeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>

      <div class="card">
        <header><span class="title">Cluster networks</span></header>
        <div v-for="(n, i) in c.networking.clusterNetwork" :key="i" class="grid-2" style="margin-bottom:6px">
          <Field label="CIDR"><input type="text" v-model="n.cidr" placeholder="10.128.0.0/14" /></Field>
          <Field label="Host prefix">
            <div class="hstack">
              <input type="number" min="8" max="30" v-model.number="n.hostPrefix" />
              <button class="btn secondary" @click="removeClusterNet(i)" type="button">✕</button>
            </div>
          </Field>
        </div>
        <button class="btn ghost" @click="addClusterNet" type="button">+ Add cluster network</button>
      </div>

      <div class="card">
        <header><span class="title">Service networks</span></header>
        <Field label="CIDRs">
          <StringList v-model="c.networking.serviceNetwork" placeholder="172.30.0.0/16" />
        </Field>
      </div>

      <div class="card">
        <header><span class="title">Machine networks</span></header>
        <div v-for="(n, i) in c.networking.machineNetwork" :key="i" class="hstack" style="margin-bottom:6px">
          <input type="text" v-model="n.cidr" placeholder="192.168.122.0/24" />
          <button class="btn secondary" @click="removeMachineNet(i)" type="button">✕</button>
        </div>
        <button class="btn ghost" @click="addMachineNet" type="button">+ Add machine network</button>
      </div>

      <div class="card">
        <header><span class="title">OVN-Kubernetes (optional)</span></header>
        <Field label="Internal join subnet" help="4.17+: overrides default 100.64.0.0/16">
          <input type="text" v-model="c.networking.ovnKubernetesConfig.internalJoinSubnet" />
        </Field>
        <Field label="Masquerade subnet">
          <input type="text" v-model="c.networking.ovnKubernetesConfig.internalMasqueradeSubnet" />
        </Field>
        <Field label="Transit switch subnet">
          <input type="text" v-model="c.networking.ovnKubernetesConfig.internalTransitSwitchSubnet" />
        </Field>
        <Field label="MTU">
          <input type="number" v-model.number="c.networking.ovnKubernetesConfig.mtu" placeholder="1400" />
        </Field>
      </div>
    </Section>

    <Section title="Platform">
      <Field label="Platform type">
        <select v-model="c.platformType">
          <option v-for="o in platformTypeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>

      <template v-if="c.platformType === 'baremetal'">
        <Field label="API VIPs">
          <StringList v-model="c.platform.baremetal.apiVIPs" placeholder="192.168.122.10" />
        </Field>
        <Field label="Ingress VIPs">
          <StringList v-model="c.platform.baremetal.ingressVIPs" placeholder="192.168.122.11" />
        </Field>
        <Field label="Emit hosts[] block" help="Agent-based installs keep host defs in agent-config.yaml. Leave off unless you need this block in install-config.">
          <input type="checkbox" v-model="c.platform.baremetal.includeHosts" />
        </Field>
      </template>
      <p v-else class="muted">Platform <code>none</code>: no platform-specific fields. Hosts go in agent-config.</p>
    </Section>

    <Section title="Proxy" :start-open="false">
      <Field label="Enable proxy"><input type="checkbox" v-model="c.proxy.enabled" /></Field>
      <template v-if="c.proxy.enabled">
        <Field label="httpProxy"><input type="text" v-model="c.proxy.httpProxy" placeholder="http://user:pass@proxy.example.com:3128" /></Field>
        <Field label="httpsProxy"><input type="text" v-model="c.proxy.httpsProxy" /></Field>
        <Field label="noProxy" help="Comma-separated. Include your service/cluster/machine CIDRs and .svc,.cluster.local."><input type="text" v-model="c.proxy.noProxy" /></Field>
      </template>
    </Section>

    <Section title="Additional trust bundle" :start-open="false">
      <Field label="PEM bundle" help="Paste PEM-encoded CA chain. Required when proxy terminates TLS.">
        <textarea v-model="c.additionalTrustBundle" placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"></textarea>
      </Field>
      <Field v-if="c.additionalTrustBundle" label="Trust bundle policy">
        <select v-model="c.additionalTrustBundlePolicy">
          <option v-for="o in trustBundlePolicyOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
    </Section>

    <Section title="Image digest sources (mirror registry)" :start-open="false">
      <div v-for="(s, i) in c.imageDigestSources" :key="i" class="card">
        <header>
          <span class="title">Source {{ i + 1 }}</span>
          <button class="btn danger" @click="removeDigestSource(i)" type="button">Remove</button>
        </header>
        <Field label="Source"><input type="text" v-model="s.source" placeholder="quay.io/openshift-release-dev/ocp-release" /></Field>
        <Field label="Mirrors">
          <StringList v-model="s.mirrors" placeholder="mirror.internal/ocp-release" />
        </Field>
      </div>
      <button class="btn ghost" @click="addDigestSource" type="button">+ Add mirror source</button>
    </Section>

    <Section title="Capabilities" :start-open="false">
      <Field label="Customize capabilities"><input type="checkbox" v-model="c.capabilities.enabled" /></Field>
      <template v-if="c.capabilities.enabled">
        <Field label="Baseline capability set">
          <select v-model="c.capabilities.baselineCapabilitySet">
            <option v-for="o in baselineCapabilityOptions" :key="o" :value="o">{{ o }}</option>
          </select>
        </Field>
        <Field label="Additional enabled capabilities">
          <div class="tag-input">
            <label v-for="cap in additionalCapabilityOptions" :key="cap" class="tag">
              <input
                type="checkbox"
                :checked="c.capabilities.additionalEnabledCapabilities.includes(cap)"
                @change="toggleCapability(cap)"
              />
              {{ cap }}
            </label>
          </div>
        </Field>
      </template>
    </Section>

    <Section title="Disk encryption" :start-open="false">
      <Field label="Enable"><input type="checkbox" v-model="c.diskEncryption.enabled" /></Field>
      <template v-if="c.diskEncryption.enabled">
        <p class="warn">Note: disk encryption is configured via MachineConfig manifests at install time, not in install-config.yaml. This UI will emit a reference MachineConfig snippet on the README — wire it up later.</p>
        <Field label="Type">
          <select v-model="c.diskEncryption.type">
            <option v-for="o in diskEncryptionTypes" :key="o" :value="o">{{ o }}</option>
          </select>
        </Field>
        <template v-if="c.diskEncryption.type === 'tang'">
          <div v-for="(t, i) in c.diskEncryption.tang" :key="i" class="card">
            <header>
              <span class="title">Tang {{ i + 1 }}</span>
              <button class="btn danger" @click="removeTangServer(i)" type="button">Remove</button>
            </header>
            <Field label="URL"><input type="text" v-model="t.url" placeholder="http://tang.example.com" /></Field>
            <Field label="Thumbprint"><input type="text" v-model="t.thumbprint" /></Field>
          </div>
          <button class="btn ghost" @click="addTangServer" type="button">+ Add Tang server</button>
        </template>
      </template>
    </Section>

    <Section title="Secrets">
      <Field label="Pull secret" help="Paste the raw JSON from console.redhat.com/openshift/install/pull-secret.">
        <textarea v-model="c.pullSecret" placeholder='{"auths":{...}}'></textarea>
      </Field>
      <Field label="SSH public key" help="Authorized key installed on all nodes (node debugging).">
        <textarea v-model="c.sshKey" placeholder="ssh-ed25519 AAAA..."></textarea>
      </Field>
    </Section>
  </div>
</template>
