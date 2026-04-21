# OCP YAML Generator

Browser-based form that generates `install-config.yaml` and `agent-config.yaml` for OpenShift agent-based installs on baremetal or platform `none`. Includes an nmstate network builder for ethernet, bonds, VLANs, and Linux bridges.

No server. Everything runs in your browser; pull secrets and SSH keys never leave the page.

## Supported OCP versions

The schema this tool emits is stable across **4.18 → 4.20**. The header has a version selector that only swaps the target of the doc-link "?" icons — the generated YAML shape does not change. Verified by fetching both 4.18 and 4.20 docs pages: identical anchor IDs, identical parameter tables.

If you target a newer release that adds or deprecates fields, those deltas will not appear in the form until this project updates. You can still edit the emitted YAML by hand.

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

- `install-config.yaml` (apiVersion `v1`) — metadata, controlPlane, compute pools, networking (cluster/service/machine, OVN-Kubernetes tunables), platform baremetal/none, proxy, additional trust bundle, imageDigestSources, capabilities (baseline + additional), FIPS, cpuPartitioningMode, featureSet, publish, pullSecret, sshKey.
- `agent-config.yaml` (apiVersion `v1beta1`) — rendezvousIP, bootArtifactsBaseURL, minimalISO, additionalNTPSources, per-host hostname/role/rootDeviceHints/MAC interfaces/nmstate networkConfig.
- nmstate — interfaces (ethernet/bond/vlan/linux-bridge), per-family IPv4/IPv6 (DHCP, autoconf, static), MTU, MAC, DNS, routes, bond mode + options, VLAN base + id, bridge STP + ports.

## Known caveats

- **Disk encryption** (TPM/Tang) is shipped via MachineConfig manifests, not `install-config.yaml`. The form surfaces the choices but does not currently emit the MachineConfig — you'll need to drop those into `openshift/` manifests before running `openshift-install agent create image`.
- **Import YAML** is best-effort. It merges known keys into the form; unknown fields are dropped. Re-export may not exactly match the input.
- Validation is light — the form will let you emit invalid combos (e.g. rendezvousIP outside the machine network). Run `openshift-install agent create cluster-manifests` on the output to validate.

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
