// Schema reference links. All URLs + anchors here have been verified to
// actually resolve (fetched HTML, extracted real id="..." attributes).
//
// OCP 4.18 puts install-config AND agent-config parameters on a single page
// with section-level anchors (no per-field anchors exist; rows use opaque
// auto-generated IDs). nmstate does have per-topic anchors.
//
// If a link breaks in a future OCP release, bump OCP_VER below.

const OCP_VER = '4.18'

const AGENT_BASE = `https://docs.redhat.com/en/documentation/openshift_container_platform/${OCP_VER}/html/installing_an_on-premise_cluster_with_the_agent-based_installer`
const PARAMS = `${AGENT_BASE}/installation-config-parameters-agent`
const PREPARING = `${AGENT_BASE}/preparing-to-install-with-agent-based-installer`

// Verified anchors on the params page (suffix `_installation-config-parameters-agent`).
const P = `_installation-config-parameters-agent`
const SEC_REQ = `${PARAMS}#installation-configuration-parameters-required${P}`
const SEC_NET = `${PARAMS}#installation-configuration-parameters-network${P}`
const SEC_OPT = `${PARAMS}#installation-configuration-parameters-optional${P}`
const SEC_BM = `${PARAMS}#installation-configuration-parameters-additional-bare${P}`
const AGENT_REQ = `${PARAMS}#agent-configuration-parameters-required${P}`
const AGENT_OPT = `${PARAMS}#agent-configuration-parameters-optional${P}`

// Verified anchors on the "Preparing to install" page.
const PREP = `_preparing-to-install-with-agent-based-installer`
const NETWORKING = `${PREPARING}#agent-install-networking${PREP}`
const HOST_CONFIG = `${PREPARING}#agent-host-config${PREP}`
const BONDS_VLANS = `${PREPARING}#agent-install-sample-config-bonds-vlans${PREP}`
const FIPS = `${PREPARING}#agent-installer-fips-compliance${PREP}`

// nmstate YAML API — per-topic anchors verified against the live page.
const NMSTATE = 'https://nmstate.io/devel/yaml_api.html'
const NM = {
  interfaces: `${NMSTATE}#interfaces`,
  base: `${NMSTATE}#base-interface`,
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

export const docs = {
  // ---- install-config.yaml — required ----
  'install.baseDomain': SEC_REQ,
  'install.metadata.name': SEC_REQ,
  'install.pullSecret': SEC_REQ,
  'install.sshKey': SEC_REQ,
  'install.controlPlane': SEC_REQ,
  'install.controlPlane.name': SEC_REQ,
  'install.controlPlane.replicas': SEC_REQ,
  'install.controlPlane.hyperthreading': SEC_REQ,
  'install.controlPlane.architecture': SEC_REQ,
  'install.compute': SEC_REQ,
  'install.compute.name': SEC_REQ,
  'install.compute.replicas': SEC_REQ,
  'install.compute.hyperthreading': SEC_REQ,
  'install.compute.architecture': SEC_REQ,

  // ---- install-config.yaml — networking ----
  'install.networking': SEC_NET,
  'install.networking.networkType': SEC_NET,
  'install.networking.clusterNetwork': SEC_NET,
  'install.networking.clusterNetwork.cidr': SEC_NET,
  'install.networking.clusterNetwork.hostPrefix': SEC_NET,
  'install.networking.serviceNetwork': SEC_NET,
  'install.networking.machineNetwork': SEC_NET,
  'install.networking.ovnKubernetesConfig': SEC_NET,
  'install.networking.ovnKubernetesConfig.internalJoinSubnet': SEC_NET,
  'install.networking.ovnKubernetesConfig.internalMasqueradeSubnet': SEC_NET,
  'install.networking.ovnKubernetesConfig.internalTransitSwitchSubnet': SEC_NET,
  'install.networking.ovnKubernetesConfig.mtu': SEC_NET,

  // ---- install-config.yaml — optional ----
  'install.publish': SEC_OPT,
  'install.fips': FIPS,
  'install.cpuPartitioningMode': SEC_OPT,
  'install.featureSet': SEC_OPT,
  'install.proxy': SEC_OPT,
  'install.proxy.httpProxy': SEC_OPT,
  'install.proxy.httpsProxy': SEC_OPT,
  'install.proxy.noProxy': SEC_OPT,
  'install.additionalTrustBundle': SEC_OPT,
  'install.additionalTrustBundlePolicy': SEC_OPT,
  'install.imageDigestSources': SEC_OPT,
  'install.imageDigestSources.source': SEC_OPT,
  'install.imageDigestSources.mirrors': SEC_OPT,
  'install.capabilities': SEC_OPT,
  'install.capabilities.baselineCapabilitySet': SEC_OPT,
  'install.capabilities.additionalEnabledCapabilities': SEC_OPT,
  'install.diskEncryption': SEC_OPT,
  'install.diskEncryption.type': SEC_OPT,
  'install.diskEncryption.tang': SEC_OPT,

  // ---- install-config.yaml — bare-metal platform ----
  'install.platformType': SEC_BM,
  'install.platform.baremetal': SEC_BM,
  'install.platform.baremetal.apiVIPs': SEC_BM,
  'install.platform.baremetal.ingressVIPs': SEC_BM,
  'install.platform.baremetal.hosts': SEC_BM,
  'install.platform.none': SEC_BM,

  // ---- agent-config.yaml — required ----
  'agent.metadata.name': AGENT_REQ,
  'agent.rendezvousIP': AGENT_REQ,
  'agent.hosts': AGENT_REQ,
  'agent.hosts.hostname': AGENT_REQ,
  'agent.hosts.role': AGENT_REQ,
  'agent.hosts.interfaces': AGENT_REQ,
  'agent.hosts.interfaces.name': AGENT_REQ,
  'agent.hosts.interfaces.macAddress': AGENT_REQ,

  // ---- agent-config.yaml — optional ----
  'agent.bootArtifactsBaseURL': AGENT_OPT,
  'agent.minimalISO': AGENT_OPT,
  'agent.additionalNTPSources': AGENT_OPT,
  'agent.hosts.rootDeviceHints': AGENT_OPT,
  'agent.hosts.rootDeviceHints.deviceName': AGENT_OPT,
  'agent.hosts.rootDeviceHints.hctl': AGENT_OPT,
  'agent.hosts.rootDeviceHints.model': AGENT_OPT,
  'agent.hosts.rootDeviceHints.vendor': AGENT_OPT,
  'agent.hosts.rootDeviceHints.serialNumber': AGENT_OPT,
  'agent.hosts.rootDeviceHints.minSizeGigabytes': AGENT_OPT,
  'agent.hosts.rootDeviceHints.wwn': AGENT_OPT,
  'agent.hosts.rootDeviceHints.wwnWithExtension': AGENT_OPT,
  'agent.hosts.rootDeviceHints.wwnVendorExtension': AGENT_OPT,
  'agent.hosts.rootDeviceHints.rotational': AGENT_OPT,

  // ---- Narrative links for networking context ----
  'agent.hosts.networkConfig': NETWORKING,
  'agent.networking.bondsVlans': BONDS_VLANS,
  'agent.hostConfig': HOST_CONFIG,

  // ---- nmstate networkConfig ----
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

export function docUrl(key) {
  return docs[key] || null
}
