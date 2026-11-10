# Platform runtime validation matrix

Status as of 2026-11-09. This is a plan and evidence map, **not** a claim of
cross-platform runtime acceptance.

## CI build/test matrix (repository workflows)

| Workflow | Runner | Target | Bundles | Notes |
|---|---|---|---|---|
| Quality (`quality.yml`) | `ubuntu-22.04` | linux-x64 | — | fmt, Clippy, workspace tests, frontend, release-asset tests, helpers, layouts, fuzz |
| Quality | `macos-15` | macOS arm64 | — | same checks on a native runner |
| Quality | `windows-latest` | windows-x64 | — | same checks on a native runner |
| Release (`release.yml`) | `ubuntu-22.04` | linux-x64 | `deb`, `rpm`, `AppImage` | builds, `--version` startup, checksums, draft prerelease |
| Release | `ubuntu-24.04-arm` | linux-arm64 | `deb`, `rpm` | ARM64 runner |
| Release | `windows-latest` | windows-x64 | `nsis` | NSIS installer |
| Release | `macos-15` | macOS arm64 | `dmg` | Apple Silicon |
| Release | `macos-15-intel` | macOS x64 | `dmg` | Intel |

Release runs on `v*` tags (draft prerelease); Quality runs on push/PR. From this
read-only checkout these workflows have **not** run on GitHub, and changing them
requires owner Actions access plus the token `workflow` scope.

## What CI establishes today

- Native compilation and the repository test suite on Linux, Windows and macOS.
- Installer bundling and artifact naming/architecture checks.
- Installed-binary `--version` startup.
- Checksums over the delivered installer bytes, gated before a draft prerelease.

CI does **not** establish: GUI rendering, real SSH/SFTP interoperability against
a user's servers, OS keychain behavior with real secrets, accessibility with a
screen reader, firmware/serial hardware, or signing/notarization.

## Manual runtime acceptance checklist (per OS, disposable environment)

1. Install the unsigned build in a disposable VM/user profile; confirm launch
   and clean uninstall.
2. Local shell: run commands, resize, scrollback, search, copy/paste, splits.
3. SSH to a disposable loopback `sshd`: password, key, encrypted key, agent,
   keyboard-interactive; reject unknown host key; reject a changed key.
4. SFTP: list, upload, download, resume an interrupted download (verified
   prefix), cancel, rename/delete, chmod, recursive transfer.
5. Tunnels: local, remote and SOCKS5 forwards; jump host chain.
6. Settings persistence; credential vault with dummy secrets (OS keychain and
   the encrypted portable vault).
7. Accessibility: keyboard-only traversal, dialog focus trap, screen reader,
   high-DPI scaling.
8. Note any SmartScreen/Gatekeeper warnings; do not disable OS protections.

## Known gaps

- Artifacts are unsigned; signing and notarization are not performed.
- RDP/VNC are experimental; RDP is excluded from normal packages.
- Linux ARM64 CI depends on hosted ARM64 runner availability.
- Native GUI acceptance is manual; only build/startup is automated.
