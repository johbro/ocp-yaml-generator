import yaml from 'js-yaml'

// ---- Helpers ----
const isEmpty = (v) => {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

// Strip keys whose values are empty/null after recursion.
// Does NOT strip `false` or `0` — those are meaningful.
function prune(obj) {
  if (Array.isArray(obj)) {
    const arr = obj.map(prune).filter((v) => !isEmpty(v))
    return arr
  }
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      const pv = prune(v)
      if (!isEmpty(pv)) out[k] = pv
    }
    return out
  }
  return obj
}

// ---- install-config.yaml ----
export function buildInstallConfig(src) {
  const out = {
    apiVersion: src.apiVersion || 'v1',
    baseDomain: src.baseDomain,
    metadata: { name: src.metadata.name },
    controlPlane: {
      name: src.controlPlane.name,
      replicas: Number(src.controlPlane.replicas),
      hyperthreading: src.controlPlane.hyperthreading,
      architecture: src.controlPlane.architecture,
    },
    compute: (src.compute || []).map((c) => ({
      name: c.name,
      replicas: Number(c.replicas),
      hyperthreading: c.hyperthreading,
      architecture: c.architecture,
    })),
    networking: buildNetworking(src.networking),
    platform: buildPlatform(src),
    fips: !!src.fips,
    cpuPartitioningMode: src.cpuPartitioningMode && src.cpuPartitioningMode !== 'None' ? src.cpuPartitioningMode : '',
    publish: src.publish,
    pullSecret: src.pullSecret,
    sshKey: src.sshKey,
  }

  // Optional blocks
  if (src.capabilities?.enabled) {
    out.capabilities = {
      baselineCapabilitySet: src.capabilities.baselineCapabilitySet,
      additionalEnabledCapabilities: src.capabilities.additionalEnabledCapabilities || [],
    }
  }
  if (src.proxy?.enabled) {
    out.proxy = {
      httpProxy: src.proxy.httpProxy,
      httpsProxy: src.proxy.httpsProxy,
      noProxy: src.proxy.noProxy,
    }
  }
  if (src.additionalTrustBundle) {
    out.additionalTrustBundle = src.additionalTrustBundle
    if (src.additionalTrustBundlePolicy) {
      out.additionalTrustBundlePolicy = src.additionalTrustBundlePolicy
    }
  }
  if ((src.imageDigestSources || []).length > 0) {
    out.imageDigestSources = src.imageDigestSources
      .filter((s) => s.source || (s.mirrors || []).length > 0)
      .map((s) => ({
        source: s.source,
        mirrors: (s.mirrors || []).filter(Boolean),
      }))
  }
  if (src.featureSet) out.featureSet = src.featureSet

  const pruned = prune(out)
  // prune() drops `{}`, but platform `none` requires an explicit empty map.
  if (src.platformType === 'none') pruned.platform = { none: {} }

  return yaml.dump(pruned, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
  })
}

function buildNetworking(n) {
  const out = {
    networkType: n.networkType,
    clusterNetwork: (n.clusterNetwork || []).map((c) => ({
      cidr: c.cidr,
      hostPrefix: Number(c.hostPrefix),
    })),
    serviceNetwork: (n.serviceNetwork || []).filter(Boolean),
    machineNetwork: (n.machineNetwork || []).map((m) => ({ cidr: m.cidr })).filter((m) => m.cidr),
  }
  const ovn = n.ovnKubernetesConfig || {}
  const ovnOut = {}
  if (ovn.internalJoinSubnet) ovnOut.internalJoinSubnet = ovn.internalJoinSubnet
  if (ovn.internalMasqueradeSubnet) ovnOut.internalMasqueradeSubnet = ovn.internalMasqueradeSubnet
  if (ovn.internalTransitSwitchSubnet) ovnOut.internalTransitSwitchSubnet = ovn.internalTransitSwitchSubnet
  if (ovn.mtu) ovnOut.mtu = Number(ovn.mtu)
  if (Object.keys(ovnOut).length > 0) out.ovnKubernetesConfig = ovnOut
  return out
}

function buildPlatform(src) {
  if (src.platformType === 'none') return { none: {} }
  const bm = src.platform.baremetal || {}
  const out = {
    baremetal: {
      apiVIPs: (bm.apiVIPs || []).filter(Boolean),
      ingressVIPs: (bm.ingressVIPs || []).filter(Boolean),
    },
  }
  if (bm.includeHosts && (bm.hosts || []).length > 0) {
    out.baremetal.hosts = bm.hosts
  }
  return out
}

// ---- agent-config.yaml ----
export function buildAgentConfig(src) {
  const out = {
    apiVersion: src.apiVersion || 'v1beta1',
    metadata: { name: src.metadata?.name },
    rendezvousIP: src.rendezvousIP,
  }
  if (src.bootArtifactsBaseURL) out.bootArtifactsBaseURL = src.bootArtifactsBaseURL
  if (src.minimalISO) out.minimalISO = true
  if ((src.additionalNTPSources || []).filter(Boolean).length > 0) {
    out.additionalNTPSources = src.additionalNTPSources.filter(Boolean)
  }
  out.hosts = (src.hosts || []).map(buildHost)
  return yaml.dump(prune(out), { lineWidth: -1, noRefs: true, quotingType: '"' })
}

function buildHost(h) {
  const out = {
    hostname: h.hostname,
    role: h.role,
  }
  if (h.rootDeviceHints?.enabled) {
    const r = h.rootDeviceHints
    out.rootDeviceHints = {
      deviceName: r.deviceName,
      hctl: r.hctl,
      model: r.model,
      vendor: r.vendor,
      serialNumber: r.serialNumber,
      minSizeGigabytes: r.minSizeGigabytes ? Number(r.minSizeGigabytes) : null,
      wwn: r.wwn,
      wwnWithExtension: r.wwnWithExtension,
      wwnVendorExtension: r.wwnVendorExtension,
      rotational: r.rotational === 'true' ? true : r.rotational === 'false' ? false : null,
    }
  }
  if ((h.interfaces || []).length > 0) {
    out.interfaces = h.interfaces
      .filter((i) => i.name || i.macAddress)
      .map((i) => ({ name: i.name, macAddress: i.macAddress }))
  }
  const nc = buildNetworkConfig(h.networkConfig)
  if (nc) out.networkConfig = nc
  return out
}

function buildNetworkConfig(nc) {
  if (!nc) return null
  const out = {}
  const ifaces = (nc.interfaces || []).map(buildNmstateIface).filter(Boolean)
  if (ifaces.length > 0) out.interfaces = ifaces
  const dns = nc['dns-resolver']?.config || {}
  const dnsOut = {}
  if ((dns.server || []).filter(Boolean).length > 0) dnsOut.server = dns.server.filter(Boolean)
  if ((dns.search || []).filter(Boolean).length > 0) dnsOut.search = dns.search.filter(Boolean)
  if (Object.keys(dnsOut).length > 0) out['dns-resolver'] = { config: dnsOut }
  const routes = (nc.routes?.config || []).filter((r) => r.destination)
  if (routes.length > 0) {
    out.routes = {
      config: routes.map((r) => {
        const rr = { destination: r.destination }
        if (r['next-hop-address']) rr['next-hop-address'] = r['next-hop-address']
        if (r['next-hop-interface']) rr['next-hop-interface'] = r['next-hop-interface']
        if (r.metric !== null && r.metric !== '' && r.metric !== undefined) rr.metric = Number(r.metric)
        if (r['table-id'] !== null && r['table-id'] !== '' && r['table-id'] !== undefined) rr['table-id'] = Number(r['table-id'])
        return rr
      }),
    }
  }
  return Object.keys(out).length > 0 ? out : null
}

function buildNmstateIface(i) {
  if (!i.name) return null
  const out = {
    name: i.name,
    type: i.type,
    state: i.state || 'up',
  }
  if (i.mtu) out.mtu = Number(i.mtu)
  if (i.macAddress) out['mac-address'] = i.macAddress

  if (i.type === 'bond') {
    const la = i['link-aggregation'] || {}
    out['link-aggregation'] = {
      mode: la.mode,
      options: cleanObject(la.options),
      port: (la.port || []).filter(Boolean),
    }
  } else if (i.type === 'vlan') {
    out.vlan = {
      'base-iface': i.vlan?.['base-iface'],
      id: Number(i.vlan?.id),
    }
  } else if (i.type === 'linux-bridge') {
    const br = i.bridge || {}
    out.bridge = {
      options: br.options?.stp ? { stp: { enabled: !!br.options.stp.enabled } } : {},
      port: (br.port || []).filter((p) => p && p.name).map((p) => ({ name: p.name })),
    }
  }

  const v4 = buildIPBlock(i.ipv4, 'ipv4')
  if (v4) out.ipv4 = v4
  const v6 = buildIPBlock(i.ipv6, 'ipv6')
  if (v6) out.ipv6 = v6
  return out
}

function buildIPBlock(ip, family) {
  if (!ip) return { enabled: false }
  if (!ip.enabled) return { enabled: false }
  const out = { enabled: true }
  out.dhcp = !!ip.dhcp
  if (family === 'ipv6') out.autoconf = !!ip.autoconf
  const addrs = (ip.address || []).filter((a) => a.ip).map((a) => ({
    ip: a.ip,
    'prefix-length': Number(a['prefix-length']),
  }))
  if (addrs.length > 0) out.address = addrs
  return out
}

function cleanObject(o) {
  if (!o) return {}
  const out = {}
  for (const [k, v] of Object.entries(o)) {
    if (v !== '' && v !== null && v !== undefined) out[k] = v
  }
  return out
}

// ---- YAML import (best-effort) ----
export function parseYaml(text) {
  return yaml.load(text)
}
