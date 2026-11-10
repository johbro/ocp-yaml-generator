import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { ocpVersion, knownOcpVersions, atLeast420, atLeast422, atLeast50, compareVersions } from '../utils/docs.js'

// One fencing credential for Two-Node OpenShift with Fencing (TNF).
// `macAddress` as an alternative identifier to `hostname` is 5.0+.
export function makeFencingCredential(overrides = {}) {
  return {
    hostname: '',
    macAddress: '',
    address: '', // redfish+https://<bmc>/redfish/v1/Systems/<id>
    username: '',
    password: '',
    certificateVerification: '', // '' (omit → Enabled) | Enabled | Disabled
    ...overrides,
  }
}

// OCP 4.18 → 5.0 defaults. Anything set to '' or [] is omitted on YAML emit.
// Fields that only exist on newer releases are gated at emit time by the
// header version picker (see utils/docs.js), so leaving them here is harmless.
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
      // Two-Node OpenShift with Fencing (TNF). GA in 4.22; agent-based
      // samples exist from 4.22. Requires replicas: 2, compute replicas 0,
      // and exactly two credentials.
      fencing: {
        enabled: false,
        credentials: [
          makeFencingCredential({ hostname: 'master-0' }),
          makeFencingCredential({ hostname: 'master-1' }),
        ],
      },
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
      // 5.0+ (Tech Preview, needs the NetworkObservabilityInstall feature gate).
      networkObservability: {
        installationPolicy: '', // '' (omit) | InstallAndEnable | NoAction
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
    // 4.22+: RHCOS base image stream. Tech Preview on 4.22 (needs
    // featureSet: TechPreviewNoUpgrade), GA on 5.0 where rhel-10 is the default.
    osImageStream: '', // '' (installer default) | rhel-9 | rhel-10
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
// baselineCapabilitySet accepts None, vCurrent, and v<release> for every
// release from 4.11 up to the one being installed — so the list follows the
// header version picker (e.g. 5.0 adds v4.19 … v4.22 and v5.0).
export const baselineCapabilityOptions = computed(() => [
  'None',
  ...knownOcpVersions
    .filter((v) => compareVersions(v, ocpVersion.value) <= 0)
    .map((v) => `v${v}`),
  'vCurrent',
])
export const additionalCapabilityOptions = [
  'baremetal', 'Build', 'CloudCredential', 'CloudControllerManager', 'Console',
  'CSISnapshot', 'DeploymentConfig', 'ImageRegistry', 'Ingress', 'Insights',
  'MachineAPI', 'marketplace', 'NodeTuning', 'OperatorLifecycleManager',
  'OperatorLifecycleManagerV1', 'Storage', 'openshift-samples',
]
export const trustBundlePolicyOptions = ['Proxyonly', 'Always']
export const cpuPartitioningOptions = ['None', 'AllNodes']
export const platformTypeOptions = ['baremetal', 'none']
// osImageStream — 4.22+ only (Tech Preview on 4.22, GA on 5.0).
export const osImageStreamOptions = ['', 'rhel-9', 'rhel-10']
// networking.networkObservability.installationPolicy — 5.0+ only.
export const networkObservabilityPolicyOptions = ['', 'InstallAndEnable', 'NoAction']
// fencing.credentials[].certificateVerification — '' omits (defaults to Enabled).
export const certificateVerificationOptions = ['', 'Enabled', 'Disabled']
// Feature gates re-exported for templates.
export { atLeast420, atLeast422, atLeast50 }
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
