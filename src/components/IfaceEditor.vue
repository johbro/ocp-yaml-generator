<script setup>
import { computed } from 'vue'
import Field from './Field.vue'
import StringList from './StringList.vue'
import AddressList from './AddressList.vue'
import { ifaceStateOptions, bondModeOptions } from '../stores/config.js'

const props = defineProps({
  iface: { type: Object, required: true },
  siblings: { type: Array, required: true }, // all interfaces in this host, for port pickers
})

const siblingNames = computed(() => props.siblings.map((i) => i.name).filter((n) => n && n !== props.iface.name))

function toggleBondPort(name) {
  const la = props.iface['link-aggregation']
  const idx = la.port.indexOf(name)
  if (idx === -1) la.port.push(name)
  else la.port.splice(idx, 1)
}
function toggleBridgePort(name) {
  const ports = props.iface.bridge.port
  const idx = ports.findIndex((p) => p.name === name)
  if (idx === -1) ports.push({ name })
  else ports.splice(idx, 1)
}
function hasBridgePort(name) {
  return props.iface.bridge.port.some((p) => p.name === name)
}

function bondOptionEntries() {
  return Object.entries(props.iface['link-aggregation'].options || {})
}
function setBondOption(key, value) {
  props.iface['link-aggregation'].options[key] = value
}
function removeBondOption(key) {
  delete props.iface['link-aggregation'].options[key]
}
function addBondOption() {
  const key = prompt('Bond option key (e.g. miimon, lacp_rate, xmit_hash_policy):')
  if (!key) return
  props.iface['link-aggregation'].options[key] = ''
}
</script>

<template>
  <div>
    <Field label="Name" doc-key="nmstate.interface.name"><input type="text" v-model="iface.name" placeholder="eno1, bond0, vlan100, br0" /></Field>
    <Field label="State" doc-key="nmstate.interface.state">
      <select v-model="iface.state">
        <option v-for="o in ifaceStateOptions" :key="o" :value="o">{{ o }}</option>
      </select>
    </Field>
    <Field label="MTU" doc-key="nmstate.interface.mtu"><input type="number" v-model.number="iface.mtu" placeholder="1500" /></Field>
    <Field v-if="iface.type === 'ethernet' || iface.type === 'bond'" label="MAC address" doc-key="nmstate.interface.macAddress">
      <input type="text" v-model="iface.macAddress" placeholder="aa:bb:cc:dd:ee:ff" />
    </Field>

    <div v-if="iface.type === 'bond'" class="card">
      <header><span class="title">Bond (link-aggregation)</span></header>
      <Field label="Mode" doc-key="nmstate.interface.bond.mode">
        <select v-model="iface['link-aggregation'].mode">
          <option v-for="o in bondModeOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
      <Field label="Ports" doc-key="nmstate.interface.bond.port" help="Slave interfaces. Define ethernet ports above first.">
        <div class="tag-input">
          <label v-for="n in siblingNames" :key="n" class="tag">
            <input type="checkbox" :checked="iface['link-aggregation'].port.includes(n)" @change="toggleBondPort(n)" />
            {{ n }}
          </label>
          <span v-if="siblingNames.length === 0" class="muted">(no other interfaces defined)</span>
        </div>
      </Field>
      <Field label="Options" doc-key="nmstate.interface.bond.options">
        <div class="vstack">
          <div v-for="[k, v] in bondOptionEntries()" :key="k" class="hstack">
            <input type="text" :value="k" disabled style="max-width:160px" />
            <input type="text" :value="v" @input="setBondOption(k, $event.target.value)" />
            <button class="btn secondary" @click="removeBondOption(k)" type="button">✕</button>
          </div>
          <button class="btn ghost" @click="addBondOption" type="button">+ Add option</button>
        </div>
      </Field>
    </div>

    <div v-if="iface.type === 'vlan'" class="card">
      <header><span class="title">VLAN</span></header>
      <Field label="Base interface" doc-key="nmstate.interface.vlan.baseIface">
        <select v-model="iface.vlan['base-iface']">
          <option value="">(select)</option>
          <option v-for="n in siblingNames" :key="n" :value="n">{{ n }}</option>
        </select>
      </Field>
      <Field label="VLAN ID" doc-key="nmstate.interface.vlan.id"><input type="number" min="1" max="4094" v-model.number="iface.vlan.id" /></Field>
    </div>

    <div v-if="iface.type === 'linux-bridge'" class="card">
      <header><span class="title">Linux bridge</span></header>
      <Field label="STP enabled" doc-key="nmstate.interface.linuxBridge.stp">
        <input type="checkbox" v-model="iface.bridge.options.stp.enabled" />
      </Field>
      <Field label="Ports" doc-key="nmstate.interface.linuxBridge.port">
        <div class="tag-input">
          <label v-for="n in siblingNames" :key="n" class="tag">
            <input type="checkbox" :checked="hasBridgePort(n)" @change="toggleBridgePort(n)" />
            {{ n }}
          </label>
        </div>
      </Field>
    </div>

    <div class="card">
      <header><span class="title">IPv4</span></header>
      <Field label="Enabled" doc-key="nmstate.interface.ipv4.enabled"><input type="checkbox" v-model="iface.ipv4.enabled" /></Field>
      <template v-if="iface.ipv4.enabled">
        <Field label="DHCP" doc-key="nmstate.interface.ipv4.dhcp"><input type="checkbox" v-model="iface.ipv4.dhcp" /></Field>
        <Field v-if="!iface.ipv4.dhcp" label="Static addresses" doc-key="nmstate.interface.ipv4.address">
          <AddressList v-model="iface.ipv4.address" family="ipv4" />
        </Field>
      </template>
    </div>

    <div class="card">
      <header><span class="title">IPv6</span></header>
      <Field label="Enabled" doc-key="nmstate.interface.ipv6.enabled"><input type="checkbox" v-model="iface.ipv6.enabled" /></Field>
      <template v-if="iface.ipv6.enabled">
        <Field label="DHCP" doc-key="nmstate.interface.ipv6.dhcp"><input type="checkbox" v-model="iface.ipv6.dhcp" /></Field>
        <Field label="Autoconf (SLAAC)" doc-key="nmstate.interface.ipv6.autoconf"><input type="checkbox" v-model="iface.ipv6.autoconf" /></Field>
        <Field v-if="!iface.ipv6.dhcp && !iface.ipv6.autoconf" label="Static addresses" doc-key="nmstate.interface.ipv6.address">
          <AddressList v-model="iface.ipv6.address" family="ipv6" />
        </Field>
      </template>
    </div>
  </div>
</template>
