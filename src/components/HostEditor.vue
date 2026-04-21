<script setup>
import Field from './Field.vue'
import Section from './Section.vue'
import StringList from './StringList.vue'
import NetworkConfigEditor from './NetworkConfigEditor.vue'
import { roleOptions } from '../stores/config.js'

const props = defineProps({
  host: { type: Object, required: true },
})

function addPhysIface() { props.host.interfaces.push({ name: '', macAddress: '' }) }
function removePhysIface(i) { props.host.interfaces.splice(i, 1) }
</script>

<template>
  <div>
    <div class="grid-2">
      <Field label="Hostname"><input type="text" v-model="host.hostname" /></Field>
      <Field label="Role">
        <select v-model="host.role">
          <option v-for="o in roleOptions" :key="o" :value="o">{{ o }}</option>
        </select>
      </Field>
    </div>

    <div class="card">
      <header>
        <span class="title">Physical interfaces (name ↔ MAC)</span>
        <button class="btn ghost" @click="addPhysIface" type="button">+ Add</button>
      </header>
      <p class="muted">Maps the NIC name used in networkConfig to the MAC the agent should match.</p>
      <div v-for="(p, i) in host.interfaces" :key="i" class="hstack" style="margin-bottom:6px">
        <input type="text" v-model="p.name" placeholder="eno1" style="flex:1" />
        <input type="text" v-model="p.macAddress" placeholder="aa:bb:cc:dd:ee:ff" style="flex:2" />
        <button class="btn secondary" @click="removePhysIface(i)" type="button">✕</button>
      </div>
    </div>

    <Section title="Root device hints" :start-open="false">
      <Field label="Enable hints"><input type="checkbox" v-model="host.rootDeviceHints.enabled" /></Field>
      <template v-if="host.rootDeviceHints.enabled">
        <div class="grid-2">
          <Field label="Device name" help="e.g. /dev/sda"><input type="text" v-model="host.rootDeviceHints.deviceName" /></Field>
          <Field label="HCTL"><input type="text" v-model="host.rootDeviceHints.hctl" placeholder="0:0:0:0" /></Field>
          <Field label="Model"><input type="text" v-model="host.rootDeviceHints.model" /></Field>
          <Field label="Vendor"><input type="text" v-model="host.rootDeviceHints.vendor" /></Field>
          <Field label="Serial"><input type="text" v-model="host.rootDeviceHints.serialNumber" /></Field>
          <Field label="Min size (GiB)"><input type="number" v-model.number="host.rootDeviceHints.minSizeGigabytes" /></Field>
          <Field label="WWN"><input type="text" v-model="host.rootDeviceHints.wwn" /></Field>
          <Field label="WWN w/ extension"><input type="text" v-model="host.rootDeviceHints.wwnWithExtension" /></Field>
          <Field label="WWN vendor extension"><input type="text" v-model="host.rootDeviceHints.wwnVendorExtension" /></Field>
          <Field label="Rotational">
            <select v-model="host.rootDeviceHints.rotational">
              <option value="any">(any)</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>
        </div>
      </template>
    </Section>

    <Section title="Network config (nmstate)">
      <NetworkConfigEditor :network-config="host.networkConfig" />
    </Section>
  </div>
</template>
