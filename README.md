# OCP YAML Generator

Browser-based form that generates `install-config.yaml` and `agent-config.yaml` for OpenShift 4.18 → 5.0 agent-based installs on baremetal or platform `none`. Includes an nmstate network builder for ethernet, bonds, VLANs, and Linux bridges.

No server. Everything runs in your browser; pull secrets and SSH keys never leave the page.

## Supported OCP versions

The header has a version selector covering **4.18, 4.19, 4.20, 4.21, 4.22 and 5.0**. It does two things: it retargets the doc-link "?" icons at that release's documentation, and it gates the handful of fields whose schema changed between releases. Everything else in `install-config.yaml` and `agent-config.yaml` is identical across the whole range (verified by diffing the parameter tables and anchor IDs of every release's docs pages).

Version-gated fields:

| Field | Versions | Status |
|---|---|---|
| `arbiter` pool + `role: arbiter` hosts (Two-Node with Arbiter) | 4.20+ | GA |
| `controlPlane.fencing.credentials[]` (Two-Node with Fencing) | 4.22+ | GA (agent-based samples exist from 4.22) |
| `controlPlane.fencing.credentials[].macAddress` as node identifier | 5.0+ | GA |
| `osImageStream` (`rhel-9` / `rhel-10`) | 4.22+ | Tech Preview on 4.22 (needs `featureSet: TechPreviewNoUpgrade`), GA on 5.0 |
| `networking.networkObservability.installationPolicy` | 5.0+ | Tech Preview (needs the `NetworkObservabilityInstall` feature gate) |
| `capabilities.baselineCapabilitySet` values | all | list grows to `v<selected release>` |

Fields a lower version does not support are hidden in the form and omitted from the emitted YAML, so switching the picker down is safe: the data stays in the form and reappears when you switch back up.

Fields that exist in newer docs but are cloud-only (`compute.management`, `endpoint.clusterUseOnly`, vSphere failure domains) are intentionally not surfaced since this tool targets baremetal / platform `none`.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build          # local preview / user-site deploy
VITE_BASE=/ocp-yaml-generator/ npm run build   # project-site deploy
npm run preview
```

## Deploy to GitHub Pages

1. Push to GitHub on the `main` branch.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push to `main`. It passes `VITE_BASE=/<repo-name>/` so project sites resolve assets correctly.

## Scope

- `install-config.yaml` (apiVersion `v1`) — metadata, controlPlane (incl. two-node fencing credentials), arbiter pool, compute pools, networking (cluster/service/machine, OVN-Kubernetes tunables, network observability policy), platform baremetal/none, proxy, additional trust bundle, imageDigestSources, capabilities (baseline + additional), FIPS, cpuPartitioningMode, featureSet, osImageStream, publish, pullSecret, sshKey.
- `agent-config.yaml` (apiVersion `v1beta1`) — rendezvousIP, bootArtifactsBaseURL, minimalISO, additionalNTPSources, per-host hostname/role/rootDeviceHints/MAC interfaces/nmstate networkConfig.
- nmstate — interfaces (ethernet/bond/vlan/linux-bridge), per-family IPv4/IPv6 (DHCP, autoconf, static), MTU, MAC, DNS, routes, bond mode + options, VLAN base + id, bridge STP + ports.

## Known caveats

- **Disk encryption** (TPM/Tang) is shipped via MachineConfig manifests, not `install-config.yaml`. The form surfaces the choices but does not currently emit the MachineConfig — you'll need to drop those into `openshift/` manifests before running `openshift-install agent create image`.
- **Import YAML** is best-effort. It merges known keys into the form; unknown fields are dropped. Re-export may not exactly match the input.
- Validation is light — the form will let you emit invalid combos (e.g. rendezvousIP outside the machine network). Two-node fencing shows inline warnings for the replica counts but does not block. Run `openshift-install agent create cluster-manifests` on the output to validate.
- **Fencing passwords** are BMC credentials and land in `install-config.yaml` in plain text, exactly as the upstream samples do. Treat the downloaded file accordingly.

## Layout

```
src/
  App.vue                     # two-pane shell
  main.js
  styles.css
  stores/config.js            # reactive data model + option lists
  utils/yaml.js               # YAML emit/import + prune-empty
  components/
    InstallConfigForm.vue
    AgentConfigForm.vue
    HostEditor.vue
    NetworkConfigEditor.vue
    IfaceEditor.vue
    AddressList.vue
    StringList.vue
    Section.vue
    Field.vue
    YamlPreview.vue
```
