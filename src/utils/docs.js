// Schema reference links. Keyed by logical field path.
// Targets prefer (1) official OCP docs with section anchors, (2) nmstate.io
// for network-config fields, (3) the openshift/installer Go types as the
// authoritative source when no stable rendered doc exists.
//
// If any link breaks or points somewhere unhelpful, fix it here — every form
// in the app goes through docUrl().

const OCP_VER = '4.18'

const INSTALL_BM = `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal/installing-bare-metal.html`
const AGENT = `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_with_agent_based_installer/preparing-to-install-with-agent-based-installer.html`
const NMSTATE = 'https://nmstate.io/devel/yaml_api.html'
const INSTALLER = `https://github.com/openshift/installer/blob/release-${OCP_VER}`

// Anchor suffixes for the bare-metal install-config reference page.
const REQ = '#installation-configuration-parameters-required_installing-bare-metal'
const NET = '#installation-configuration-parameters-network_installing-bare-metal'
const OPT = '#installation-configuration-parameters-optional_installing-bare-metal'
const BM = '#additional-bare-metal-configuration-parameters_installing-bare-metal'

export const docs = {
  // ---- install-config.yaml — identity ----
  'install.baseDomain': INSTALL_BM + REQ,
  'install.metadata.name': INSTALL_BM + REQ,
  'install.publish': INSTALL_BM + OPT,
  'install.fips': INSTALL_BM + OPT,
  'install.cpuPartitioningMode': `${INSTALLER}/pkg/types/installconfig.go`,
  'install.featureSet': INSTALL_BM + OPT,

  // ---- controlPlane / compute ----
  'install.controlPlane': INSTALL_BM + REQ,
  'install.controlPlane.name': INSTALL_BM + REQ,
  'install.controlPlane.replicas': INSTALL_BM + REQ,
  'install.controlPlane.hyperthreading': INSTALL_BM + REQ,
  'install.controlPlane.architecture': INSTALL_BM + REQ,
  'install.compute': INSTALL_BM + REQ,
  'install.compute.name': INSTALL_BM + REQ,
  'install.compute.replicas': INSTALL_BM + REQ,
  'install.compute.hyperthreading': INSTALL_BM + REQ,
  'install.compute.architecture': INSTALL_BM + REQ,

  // ---- networking ----
  'install.networking': INSTALL_BM + NET,
  'install.networking.networkType': INSTALL_BM + NET,
  'install.networking.clusterNetwork': INSTALL_BM + NET,
  'install.networking.clusterNetwork.cidr': INSTALL_BM + NET,
  'install.networking.clusterNetwork.hostPrefix': INSTALL_BM + NET,
  'install.networking.serviceNetwork': INSTALL_BM + NET,
  'install.networking.machineNetwork': INSTALL_BM + NET,
  'install.networking.ovnKubernetesConfig': `${INSTALLER}/pkg/types/networking.go`,
  'install.networking.ovnKubernetesConfig.internalJoinSubnet': `${INSTALLER}/pkg/types/networking.go`,
  'install.networking.ovnKubernetesConfig.internalMasqueradeSubnet': `${INSTALLER}/pkg/types/networking.go`,
  'install.networking.ovnKubernetesConfig.internalTransitSwitchSubnet': `${INSTALLER}/pkg/types/networking.go`,
  'install.networking.ovnKubernetesConfig.mtu': `${INSTALLER}/pkg/types/networking.go`,

  // ---- platform ----
  'install.platformType': INSTALL_BM + BM,
  'install.platform.baremetal': INSTALL_BM + BM,
  'install.platform.baremetal.apiVIPs': INSTALL_BM + BM,
  'install.platform.baremetal.ingressVIPs': INSTALL_BM + BM,
  'install.platform.baremetal.hosts': INSTALL_BM + BM,
  'install.platform.none': `${INSTALLER}/pkg/types/none/platform.go`,

  // ---- proxy / trust bundle / mirroring ----
  'install.proxy': INSTALL_BM + OPT,
  'install.proxy.httpProxy': INSTALL_BM + OPT,
  'install.proxy.httpsProxy': INSTALL_BM + OPT,
  'install.proxy.noProxy': INSTALL_BM + OPT,
  'install.additionalTrustBundle': INSTALL_BM + OPT,
  'install.additionalTrustBundlePolicy': INSTALL_BM + OPT,
  'install.imageDigestSources': INSTALL_BM + OPT,
  'install.imageDigestSources.source': INSTALL_BM + OPT,
  'install.imageDigestSources.mirrors': INSTALL_BM + OPT,

  // ---- capabilities ----
  'install.capabilities': INSTALL_BM + OPT,
  'install.capabilities.baselineCapabilitySet': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/overview/cluster-capabilities.html`,
  'install.capabilities.additionalEnabledCapabilities': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/overview/cluster-capabilities.html`,

  // ---- disk encryption (MachineConfig) ----
  'install.diskEncryption': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/install_config/installing-customizing.html`,
  'install.diskEncryption.type': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/install_config/installing-customizing.html`,
  'install.diskEncryption.tang': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/install_config/installing-customizing.html`,

  // ---- secrets ----
  'install.pullSecret': INSTALL_BM + REQ,
  'install.sshKey': INSTALL_BM + REQ,

  // ---- agent-config.yaml ----
  'agent.metadata.name': AGENT,
  'agent.rendezvousIP': AGENT,
  'agent.bootArtifactsBaseURL': AGENT,
  'agent.minimalISO': AGENT,
  'agent.additionalNTPSources': AGENT,
  'agent.hosts': AGENT,
  'agent.hosts.hostname': AGENT,
  'agent.hosts.role': AGENT,
  'agent.hosts.interfaces': AGENT,
  'agent.hosts.interfaces.name': AGENT,
  'agent.hosts.interfaces.macAddress': AGENT,
  'agent.hosts.rootDeviceHints': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.deviceName': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.hctl': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.model': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.vendor': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.serialNumber': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.minSizeGigabytes': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.wwn': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.wwnWithExtension': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.wwnVendorExtension': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,
  'agent.hosts.rootDeviceHints.rotational': `https://docs.openshift.com/container-platform/${OCP_VER}/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#root-device-hints_ipi-install-installation-workflow`,

  // ---- nmstate networkConfig ----
  'nmstate.interfaces': NMSTATE + '#interface',
  'nmstate.interface.name': NMSTATE + '#interface',
  'nmstate.interface.type': NMSTATE + '#interface',
  'nmstate.interface.state': NMSTATE + '#interface',
  'nmstate.interface.mtu': NMSTATE + '#interface',
  'nmstate.interface.macAddress': NMSTATE + '#interface',
  'nmstate.interface.ethernet': NMSTATE + '#ethernet',
  'nmstate.interface.bond': NMSTATE + '#link-aggregation-bond',
  'nmstate.interface.bond.mode': NMSTATE + '#link-aggregation-bond',
  'nmstate.interface.bond.options': NMSTATE + '#link-aggregation-bond',
  'nmstate.interface.bond.port': NMSTATE + '#link-aggregation-bond',
  'nmstate.interface.vlan': NMSTATE + '#vlan',
  'nmstate.interface.vlan.baseIface': NMSTATE + '#vlan',
  'nmstate.interface.vlan.id': NMSTATE + '#vlan',
  'nmstate.interface.linuxBridge': NMSTATE + '#linux-bridge',
  'nmstate.interface.linuxBridge.stp': NMSTATE + '#linux-bridge',
  'nmstate.interface.linuxBridge.port': NMSTATE + '#linux-bridge',
  'nmstate.interface.ipv4': NMSTATE + '#ipv4',
  'nmstate.interface.ipv4.enabled': NMSTATE + '#ipv4',
  'nmstate.interface.ipv4.dhcp': NMSTATE + '#ipv4',
  'nmstate.interface.ipv4.address': NMSTATE + '#ipv4',
  'nmstate.interface.ipv6': NMSTATE + '#ipv6',
  'nmstate.interface.ipv6.enabled': NMSTATE + '#ipv6',
  'nmstate.interface.ipv6.dhcp': NMSTATE + '#ipv6',
  'nmstate.interface.ipv6.autoconf': NMSTATE + '#ipv6',
  'nmstate.interface.ipv6.address': NMSTATE + '#ipv6',
  'nmstate.dnsResolver': NMSTATE + '#dns-resolver',
  'nmstate.dnsResolver.server': NMSTATE + '#dns-resolver',
  'nmstate.dnsResolver.search': NMSTATE + '#dns-resolver',
  'nmstate.routes': NMSTATE + '#route',
  'nmstate.route.destination': NMSTATE + '#route',
  'nmstate.route.nextHopAddress': NMSTATE + '#route',
  'nmstate.route.nextHopInterface': NMSTATE + '#route',
  'nmstate.route.metric': NMSTATE + '#route',
  'nmstate.route.tableId': NMSTATE + '#route',
}

export function docUrl(key) {
  return docs[key] || null
}
