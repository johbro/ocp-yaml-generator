import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { atLeast420 } from '../utils/docs.js'

// OCP 4.18+ defaults. Anything set to '' or [] is omitted on YAML emit.
function makeInstallConfig() {
  return {
    apiVersion: 'v1',
    baseDomain: 'example.com',
    metadata: { name: 'ocp' },
    controlPlane: {
      name: 'master',
      replicas: 3,
      hyperthreading: 'Enabled',
      architecture: 'amd64',
    },
    compute: [
      {
        name: 'worker',
        replicas: 2,
        hyperthreading: 'Enabled',
        architecture: 'amd64',
      },
    ],
    networking: {
      networkType: 'OVNKubernetes',
      clusterNetwork: [{ cidr: '10.128.0.0/14', hostPrefix: 23 }],
      serviceNetwork: ['172.30.0.0/16'],
      machineNetwork: [{ cidr: '192.168.122.0/24' }],
      ovnKubernetesConfig: {
        // 4.18: dual-stack / egress / internal transit / mtu knobs live here if needed
        internalJoinSubnet: '',
        internalMasqueradeSubnet: '',
        internalTransitSwitchSubnet: '',
        mtu: null,
      },
    },
    platformType: 'baremetal', // baremetal | none
    platform: {
      baremetal: {
        apiVIPs: ['192.168.122.10'],
        ingressVIPs: ['192.168.122.11'],
        // The agent installer does NOT require the hosts[] block in install-config
        // when agent-config.yaml is used — keep it off by default.
        includeHosts: false,
        hosts: [],
      },
    },
    // Arbiter pool (OCP 4.20+ — Two-Node OpenShift with Arbiter / TNA).
    arbiter: {
      enabled: false,
      name: 'arbiter',
      replicas: 1,
      hyperthreading: 'Enabled',
      architecture: 'amd64',
    },
    fips: false,
    cpuPartitioningMode: 'None', // None | AllNodes
    publish: 'External', // External | Internal | Mixed
    capabilities: {
      enabled: false,
      baselineCapabilitySet: 'vCurrent', // None | v4.11 | v4.12 | ... | vCurrent
      additionalEnabledCapabilities: [],
    },
    proxy: {
      enabled: false,
      httpProxy: '',
      httpsProxy: '',
      noProxy: '',
    },
    additionalTrustBundle: '',
    additionalTrustBundlePolicy: 'Proxyonly', // Proxyonly | Always
    imageDigestSources: [], // [{ source, mirrors: [] }]
    featureSet: '', // '' | TechPreviewNoUpgrade | CustomNoUpgrade | DevPreviewNoUpgrade
    diskEncryption: {
      enabled: false,
      type: 'tpmv2', // tpmv2 | tang
      tang: [], // [{ url, thumbprint }]
    },
    pullSecret: '',
    sshKey: '',
  }
}

function makeAgentConfig() {
  return {
    apiVersion: 'v1beta1',
    metadata: { name: 'ocp' },
    rendezvousIP: '192.168.122.20',
    bootArtifactsBaseURL: '',
    minimalISO: false,
    additionalNTPSources: [],
    hosts: [
      makeHost({
        hostname: 'master-0',
        role: 'master',
      }),
    ],
  }
}

export function makeHost(overrides = {}) {
  return {
    hostname: '',
    role: 'master', // master | worker
    rootDeviceHints: {
      enabled: false,
      deviceName: '',
      hctl: '',
      model: '',
      vendor: '',
      serialNumber: '',
      minSizeGigabytes: null,
      wwn: '',
      wwnWithExtension: '',
      wwnVendorExtension: '',
      rotational: 'any', // 'any' (omit) | 'true' | 'false'
    },
    interfaces: [
      // Link between nmstate iface name and physical MAC.
      // { name: 'eno1', macAddress: '' },
    ],
    networkConfig: {
      interfaces: [], // see makeIface
      'dns-resolver': { config: { server: [], search: [] } },
      routes: { config: [] }, // [{ destination, 'next-hop-address', 'next-hop-interface', metric, 'table-id' }]
    },
    ...overrides,
  }
}

export function makeIface(type = 'ethernet') {
  const base = {
    name: '',
    type, // ethernet | bond | vlan | linux-bridge
    state: 'up',
    mtu: null,
    macAddress: '',
    ipv4: { enabled: false, dhcp: false, autoconf: false, address: [] },
    ipv6: { enabled: false, dhcp: false, autoconf: false, address: [] },
  }
  if (type === 'bond') {
    base['link-aggregation'] = {
      mode: 'active-backup', // active-backup | balance-rr | balance-xor | broadcast | 802.3ad | balance-tlb | balance-alb
      options: { miimon: '100' },
      port: [],
    }
  }
  if (type === 'vlan') {
    base.vlan = { 'base-iface': '', id: 100 }
  }
  if (type === 'linux-bridge') {
    base.bridge = { options: { stp: { enabled: false } }, port: [] } // port: [{ name }]
  }
  return base
}

export function makeAddress() {
  return { ip: '', 'prefix-length': 24 }
}

export const useConfig = defineStore('config', () => {
  const install = reactive(makeInstallConfig())
  const agent = reactive(makeAgentConfig())

  function resetInstall() { Object.assign(install, makeInstallConfig()) }
  function resetAgent() { Object.assign(agent, makeAgentConfig()) }

  return { install, agent, resetInstall, resetAgent }
})

// ----- Option lists -----
export const hyperthreadingOptions = ['Enabled', 'Disabled']
export const architectureOptions = ['amd64', 'arm64', 'ppc64le', 's390x']
export const networkTypeOptions = ['OVNKubernetes']
export const publishOptions = ['External', 'Internal', 'Mixed']
export const featureSetOptions = ['', 'TechPreviewNoUpgrade', 'CustomNoUpgrade', 'DevPreviewNoUpgrade']
export const baselineCapabilityOptions = [
  'None', 'v4.11', 'v4.12', 'v4.13', 'v4.14', 'v4.15', 'v4.16', 'v4.17', 'v4.18', 'vCurrent',
]
export const additionalCapabilityOptions = [
  'baremetal', 'Build', 'CloudCredential', 'CloudControllerManager', 'Console',
  'CSISnapshot', 'DeploymentConfig', 'ImageRegistry', 'Ingress', 'Insights',
  'MachineAPI', 'marketplace', 'NodeTuning', 'OperatorLifecycleManager',
  'OperatorLifecycleManagerV1', 'Storage', 'openshift-samples',
]
export const trustBundlePolicyOptions = ['Proxyonly', 'Always']
export const cpuPartitioningOptions = ['None', 'AllNodes']
export const platformTypeOptions = ['baremetal', 'none']
// Agent host roles — 'arbiter' is valid only on 4.20+.
export const roleOptions = computed(() =>
  atLeast420.value ? ['master', 'arbiter', 'worker'] : ['master', 'worker']
)
export const ifaceTypeOptions = ['ethernet', 'bond', 'vlan', 'linux-bridge']
export const ifaceStateOptions = ['up', 'down', 'absent']
export const bondModeOptions = [
  'active-backup', 'balance-rr', 'balance-xor', 'broadcast',
  '802.3ad', 'balance-tlb', 'balance-alb',
]
export const diskEncryptionTypes = ['tpmv2', 'tang']
