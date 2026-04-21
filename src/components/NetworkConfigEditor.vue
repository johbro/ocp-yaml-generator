<script setup>
import IfaceEditor from './IfaceEditor.vue'
import Field from './Field.vue'
import StringList from './StringList.vue'
import { makeIface, ifaceTypeOptions } from '../stores/config.js'

const props = defineProps({
  networkConfig: { type: Object, required: true },
})

function addIface(type) {
  props.networkConfig.interfaces.push(makeIface(type))
}
function removeIface(i) { props.networkConfig.interfaces.splice(i, 1) }
function moveIface(i, dir) {
  const arr = props.networkConfig.interfaces
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}

function addRoute() {
  props.networkConfig.routes.config.push({
    destination: '',
    'next-hop-address': '',
    'next-hop-interface': '',
    metric: null,
    'table-id': null,
  })
}
function removeRoute(i) { props.networkConfig.routes.config.splice(i, 1) }
</script>

<template>
  <div>
    <div class="card">
      <header>
        <span class="title">Interfaces</span>
        <div class="toolbar">
          <button v-for="t in ifaceTypeOptions" :key="t" class="btn secondary" type="button" @click="addIface(t)">+ {{ t }}</button>
        </div>
      </header>
      <div v-if="networkConfig.interfaces.length === 0" class="muted">No interfaces yet.</div>
      <div v-for="(iface, i) in networkConfig.interfaces" :key="i" class="card">
        <header>
          <span class="title">{{ iface.name || `(${iface.type})` }} <span class="badge">{{ iface.type }}</span></span>
          <div class="hstack">
            <button class="btn secondary" @click="moveIface(i, -1)" type="button">↑</button>
            <button class="btn secondary" @click="moveIface(i, 1)" type="button">↓</button>
            <button class="btn danger" @click="removeIface(i)" type="button">Remove</button>
          </div>
        </header>
        <IfaceEditor :iface="iface" :siblings="networkConfig.interfaces" />
      </div>
    </div>

    <div class="card">
      <header><span class="title">DNS</span></header>
      <Field label="Nameservers" doc-key="nmstate.dnsResolver.server">
        <StringList v-model="networkConfig['dns-resolver'].config.server" placeholder="192.168.122.1" />
      </Field>
      <Field label="Search domains" doc-key="nmstate.dnsResolver.search">
        <StringList v-model="networkConfig['dns-resolver'].config.search" placeholder="example.com" />
      </Field>
    </div>

    <div class="card">
      <header>
        <span class="title">Routes</span>
        <button class="btn ghost" @click="addRoute" type="button">+ Add route</button>
      </header>
      <div v-for="(r, i) in networkConfig.routes.config" :key="i" class="card">
        <header>
          <span class="title">{{ r.destination || 'route' }}</span>
          <button class="btn danger" @click="removeRoute(i)" type="button">Remove</button>
        </header>
        <Field label="Destination" doc-key="nmstate.route.destination"><input type="text" v-model="r.destination" placeholder="0.0.0.0/0" /></Field>
        <Field label="Next-hop address" doc-key="nmstate.route.nextHopAddress"><input type="text" v-model="r['next-hop-address']" placeholder="192.168.122.1" /></Field>
        <Field label="Next-hop interface" doc-key="nmstate.route.nextHopInterface">
          <select v-model="r['next-hop-interface']">
            <option value="">(any)</option>
            <option v-for="iface in networkConfig.interfaces" :key="iface.name" :value="iface.name">{{ iface.name }}</option>
          </select>
        </Field>
        <Field label="Metric" doc-key="nmstate.route.metric"><input type="number" v-model.number="r.metric" /></Field>
        <Field label="Table ID" doc-key="nmstate.route.tableId"><input type="number" v-model.number="r['table-id']" placeholder="254" /></Field>
      </div>
    </div>
  </div>
</template>
