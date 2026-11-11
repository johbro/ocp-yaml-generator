// Schema reference links. All URLs + anchors verified against the live docs
// for OCP 4.18, 4.19, 4.20, 4.21, 4.22 and 5.0 — the anchor IDs are
// byte-identical across versions, so switching `ocpVersion` just swaps the
// base URL path.
//
// Each key must point at the section that actually documents that field.
// The agent-based parameter tables split differently than you might guess
// (e.g. controlPlane/compute/sshKey are "optional", and everything in
// agent-config except metadata is "optional"), and they omit some fields
// entirely (proxy, disk encryption, VIPs, most root device hints) — those
// link to the narrative section or the bare-metal reference instead.
//
// nmstate uses a single rolling page with stable per-topic anchors.

import { ref, watch, computed } from 'vue'

// Every release this tool knows about, oldest → newest. Also drives the
// `baselineCapabilitySet` option list (v4.11 … v<selected>).
export const knownOcpVersions = [
  '4.11', '4.12', '4.13', '4.14', '4.15', '4.16', '4.17',
  '4.18', '4.19', '4.20', '4.21', '4.22', '5.0',
]
// Releases selectable in the header picker (the ones whose docs we verified).
export const ocpVersionOptions = ['4.18', '4.19', '4.20', '4.21', '4.22', '5.0']
const DEFAULT_VERSION = '5.0'

function loadStoredVersion() {
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem('ocpVersion')
  return ocpVersionOptions.includes(v) ? v : null
}

export const ocpVersion = ref(loadStoredVersion() || DEFAULT_VERSION)
if (typeof localStorage !== 'undefined') {
  watch(ocpVersion, (v) => localStorage.setItem('ocpVersion', v))
}

// ---- Version comparison ----
// Parses "4.20" → [4, 20], "5.0" → [5, 0]. A plain minor-only compare breaks
// at the 4.x → 5.0 boundary, so always compare [major, minor] tuples.
export function parseVersion(v) {
  const [maj, min] = String(v).split('.').map((n) => Number(n) || 0)
  return [maj, min]
}
export function compareVersions(a, b) {
  const [am, an] = parseVersion(a)
  const [bm, bn] = parseVersion(b)
  return am !== bm ? am - bm : an - bn
}
export function versionAtLeast(v, target) { return compareVersions(v, target) >= 0 }

// Reactive feature gates keyed off the picker. Add one per schema delta.
export const atLeast420 = computed(() => versionAtLeast(ocpVersion.value, '4.20')) // arbiter pool (TNA)
export const atLeast422 = computed(() => versionAtLeast(ocpVersion.value, '4.22')) // osImageStream, TNF fencing
export const atLeast50 = computed(() => versionAtLeast(ocpVersion.value, '5.0'))   // networkObservability, fencing macAddress
export const isMajor5 = computed(() => parseVersion(ocpVersion.value)[0] >= 5)

// ---- Per-version URL builders (doc pages only; nmstate is versionless) ----
function buildMap(ver) {
  const AGENT_BASE = `https://docs.redhat.com/en/documentation/openshift_container_platform/${ver}/html/installing_an_on-premise_cluster_with_the_agent-based_installer`
  const PARAMS = `${AGENT_BASE}/installation-config-parameters-agent`
  const PREPARING = `${AGENT_BASE}/preparing-to-install-with-agent-based-installer`

  const P = `_installation-config-parameters-agent`
  const SEC_REQ = `${PARAMS}#installation-configuration-parameters-required${P}`
  const SEC_NET = `${PARAMS}#installation-configuration-parameters-network${P}`
  const SEC_OPT = `${PARAMS}#installation-configuration-parameters-optional${P}`
  const SEC_BM = `${PARAMS}#installation-configuration-parameters-additional-bare${P}`
  const AGENT_REQ = `${PARAMS}#agent-configuration-parameters-required${P}`
  const AGENT_OPT = `${PARAMS}#agent-configuration-parameters-optional${P}`

  const PREP = `_preparing-to-install-with-agent-based-installer`
  const NETWORKING = `${PREPARING}#agent-install-networking${PREP}`
  const HOST_CONFIG = `${PREPARING}#agent-host-config${PREP}`
  const BONDS_VLANS = `${PREPARING}#agent-install-sample-config-bonds-vlans${PREP}`
  const FIPS = `${PREPARING}#agent-installer-fips-compliance${PREP}`
  const ROOT_HINTS = `${PREPARING}#root-device-hints${PREP}`
  const PLATFORM_NONE = `${PREPARING}#installation-requirements-platform-none${PREP}`
  // Sample bare-metal install-config.yaml — the only place the agent-based
  // book describes apiVIPs / ingressVIPs.
  const SAMPLE_INSTALL = `${PREPARING}#installation-bare-metal-agent-installer-config-yaml${PREP}`

  const DISK_ENCRYPTION = `${AGENT_BASE}/installing-with-agent-based-installer#installing-ocp-agent-encrypt_installing-with-agent-based-installer`
  const MIRRORING = `${AGENT_BASE}/understanding-disconnected-installation-mirroring#agent-install-configuring-for-disconnected-registry_understanding-disconnected-installation-mirroring`

  // Fields the agent-based book does not document; same install-config
  // schema, described in the bare-metal book.
  const BM_UPI = `https://docs.redhat.com/en/documentation/openshift_container_platform/${ver}/html/installing_on_bare_metal/user-provisioned-infrastructure`
  const PROXY = `${BM_UPI}#installation-configure-proxy_installing-bare-metal`
  const OVN_CONFIG = `${BM_UPI}#nw-operator-configuration-parameters-for-ovn-sdn_installing-bare-metal-network-customizations`

  // Two-node topologies live in their own book (4.20+). Anchors verified on
  // 4.20, 4.21, 4.22 and 5.0; the agent-based TNF samples exist from 4.22.
  const TWO_NODE = `https://docs.redhat.com/en/documentation/openshift_container_platform/${ver}/html-single/installing_a_two_node_openshift_cluster/index`
  const ARBITER_ABOUT = `${TWO_NODE}#about-two-node-arbiter-installation`
  const TNF_INSTALL_SAMPLE = `${TWO_NODE}#sample-install-config-two-node-fencing-abi_install-tnf`

  const NMSTATE = 'https://nmstate.io/devel/yaml_api.html'
  const NM = {
    interfaces: `${NMSTATE}#interfaces`,
    name: `${NMSTATE}#name`,
    type: `${NMSTATE}#type`,
    state: `${NMSTATE}#state`,
    mtu: `${NMSTATE}#mtu`,
    mac: `${NMSTATE}#mac-address`,
    ethernet: `${NMSTATE}#ethernet-interface`,
    bond: `${NMSTATE}#bond-interface`,
    bondMode: `${NMSTATE}#bond-mode`,
    bondOptions: `${NMSTATE}#bond-options`,
    bondPorts: `${NMSTATE}#bond-ports`,
    vlan: `${NMSTATE}#vlan-interface`,
    bridge: `${NMSTATE}#linux-bridge-interface`,
    bridgeOptions: `${NMSTATE}#linux-bridge-options`,
    bridgePorts: `${NMSTATE}#linux-bridge-ports`,
    ip: `${NMSTATE}#ip`,
    ipEnable: `${NMSTATE}#ip-enable`,
    ipAddress: `${NMSTATE}#ip-address`,
    dhcp: `${NMSTATE}#dhcp`,
    autoconf: `${NMSTATE}#ipv6-autoconf`,
    dns: `${NMSTATE}#dns-resolver`,
    routes: `${NMSTATE}#routes`,
  }

  return {
    // install-config — required (only these + platform are in the required table)
    'install.baseDomain': SEC_REQ,
    'install.metadata.name': SEC_REQ,
    'install.pullSecret': SEC_REQ,
    'install.sshKey': SEC_OPT,
    'install.controlPlane': SEC_OPT,
    'install.controlPlane.name': SEC_OPT,
    'install.controlPlane.replicas': SEC_OPT,
    'install.controlPlane.hyperthreading': SEC_OPT,
    'install.controlPlane.architecture': SEC_OPT,
    'install.compute': SEC_OPT,
    'install.compute.name': SEC_OPT,
    'install.compute.replicas': SEC_OPT,
    'install.compute.hyperthreading': SEC_OPT,
    'install.compute.architecture': SEC_OPT,

    // install-config — networking
    'install.networking': SEC_NET,
    'install.networking.networkType': SEC_NET,
    'install.networking.clusterNetwork': SEC_NET,
    'install.networking.clusterNetwork.cidr': SEC_NET,
    'install.networking.clusterNetwork.hostPrefix': SEC_NET,
    'install.networking.serviceNetwork': SEC_NET,
    'install.networking.machineNetwork': SEC_NET,
    'install.networking.ovnKubernetesConfig': SEC_NET,
    'install.networking.ovnKubernetesConfig.internalJoinSubnet': SEC_NET,
    'install.networking.ovnKubernetesConfig.internalMasqueradeSubnet': OVN_CONFIG,
    'install.networking.ovnKubernetesConfig.internalTransitSwitchSubnet': OVN_CONFIG,
    'install.networking.ovnKubernetesConfig.mtu': OVN_CONFIG,
    'install.networking.networkObservability': SEC_NET,
    'install.networking.networkObservability.installationPolicy': SEC_NET,

    // install-config — optional
    'install.publish': SEC_OPT,
    'install.fips': FIPS,
    'install.cpuPartitioningMode': SEC_OPT,
    'install.featureSet': SEC_OPT,
    'install.osImageStream': SEC_OPT,
    'install.proxy': PROXY,
    'install.proxy.httpProxy': PROXY,
    'install.proxy.httpsProxy': PROXY,
    'install.proxy.noProxy': PROXY,
    'install.additionalTrustBundle': SEC_OPT,
    'install.additionalTrustBundlePolicy': PROXY,
    'install.imageDigestSources': MIRRORING,
    'install.imageDigestSources.source': MIRRORING,
    'install.imageDigestSources.mirrors': MIRRORING,
    'install.capabilities': SEC_OPT,
    'install.capabilities.baselineCapabilitySet': SEC_OPT,
    'install.capabilities.additionalEnabledCapabilities': SEC_OPT,
    'install.diskEncryption': DISK_ENCRYPTION,
    'install.diskEncryption.type': DISK_ENCRYPTION,
    'install.diskEncryption.tang': DISK_ENCRYPTION,

    // install-config — two-node with fencing (TNF, 4.22+ for agent-based)
    'install.controlPlane.fencing': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.hostname': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.macAddress': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.address': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.username': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.password': TNF_INSTALL_SAMPLE,
    'install.controlPlane.fencing.credentials.certificateVerification': TNF_INSTALL_SAMPLE,

    // install-config — arbiter pool (4.20+)
    'install.arbiter': ARBITER_ABOUT,
    'install.arbiter.name': SEC_OPT,
    'install.arbiter.replicas': SEC_OPT,
    'install.arbiter.hyperthreading': SEC_OPT,
    'install.arbiter.architecture': SEC_OPT,

    // install-config — bare-metal platform
    'install.platformType': SEC_REQ,
    'install.platform.baremetal': SEC_BM,
    'install.platform.baremetal.apiVIPs': SAMPLE_INSTALL,
    'install.platform.baremetal.ingressVIPs': SAMPLE_INSTALL,
    'install.platform.baremetal.hosts': SEC_BM,
    'install.platform.none': PLATFORM_NONE,

    // agent-config — required
    'agent.metadata.name': AGENT_REQ,

    // agent-config — optional (rendezvousIP and hosts.* live in this table)
    'agent.rendezvousIP': AGENT_OPT,
    'agent.hosts': AGENT_OPT,
    'agent.hosts.hostname': AGENT_OPT,
    'agent.hosts.role': AGENT_OPT,
    'agent.hosts.interfaces': AGENT_OPT,
    'agent.hosts.interfaces.name': AGENT_OPT,
    'agent.hosts.interfaces.macAddress': AGENT_OPT,

    'agent.bootArtifactsBaseURL': AGENT_OPT,
    'agent.minimalISO': AGENT_OPT,
    'agent.additionalNTPSources': AGENT_OPT,
    'agent.hosts.rootDeviceHints': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.deviceName': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.hctl': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.model': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.vendor': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.serialNumber': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.minSizeGigabytes': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.wwn': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.wwnWithExtension': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.wwnVendorExtension': ROOT_HINTS,
    'agent.hosts.rootDeviceHints.rotational': ROOT_HINTS,

    // Narrative links
    'agent.hosts.networkConfig': NETWORKING,
    'agent.networking.bondsVlans': BONDS_VLANS,
    'agent.hostConfig': HOST_CONFIG,

    // nmstate networkConfig (versionless)
    'nmstate.interfaces': NM.interfaces,
    'nmstate.interface.name': NM.name,
    'nmstate.interface.type': NM.type,
    'nmstate.interface.state': NM.state,
    'nmstate.interface.mtu': NM.mtu,
    'nmstate.interface.macAddress': NM.mac,
    'nmstate.interface.ethernet': NM.ethernet,
    'nmstate.interface.bond': NM.bond,
    'nmstate.interface.bond.mode': NM.bondMode,
    'nmstate.interface.bond.options': NM.bondOptions,
    'nmstate.interface.bond.port': NM.bondPorts,
    'nmstate.interface.vlan': NM.vlan,
    'nmstate.interface.vlan.baseIface': NM.vlan,
    'nmstate.interface.vlan.id': NM.vlan,
    'nmstate.interface.linuxBridge': NM.bridge,
    'nmstate.interface.linuxBridge.stp': NM.bridgeOptions,
    'nmstate.interface.linuxBridge.port': NM.bridgePorts,
    'nmstate.interface.ipv4': NM.ip,
    'nmstate.interface.ipv4.enabled': NM.ipEnable,
    'nmstate.interface.ipv4.dhcp': NM.dhcp,
    'nmstate.interface.ipv4.address': NM.ipAddress,
    'nmstate.interface.ipv6': NM.ip,
    'nmstate.interface.ipv6.enabled': NM.ipEnable,
    'nmstate.interface.ipv6.dhcp': NM.dhcp,
    'nmstate.interface.ipv6.autoconf': NM.autoconf,
    'nmstate.interface.ipv6.address': NM.ipAddress,
    'nmstate.dnsResolver': NM.dns,
    'nmstate.dnsResolver.server': NM.dns,
    'nmstate.dnsResolver.search': NM.dns,
    'nmstate.routes': NM.routes,
    'nmstate.route.destination': NM.routes,
    'nmstate.route.nextHopAddress': NM.routes,
    'nmstate.route.nextHopInterface': NM.routes,
    'nmstate.route.metric': NM.routes,
    'nmstate.route.tableId': NM.routes,
  }
}

const cache = new Map()
function getMap(ver) {
  if (!cache.has(ver)) cache.set(ver, buildMap(ver))
  return cache.get(ver)
}

export function docUrl(key) {
  return getMap(ocpVersion.value)[key] || null
}
