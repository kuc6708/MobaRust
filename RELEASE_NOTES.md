# MobaRust 0.1.32-rc.1 — Release Candidate Notes

**Status: verified, installable release candidate — UNPUBLISHED.** No GitHub
release was created and the tag exists only locally. The five documented
dependency warnings remain; a stable release is not approved.

- Branch: `rea/production-readiness-2026-11-09`
- Commit: `1049c0d`
- Intended tag: `v0.1.32-rc.1` (created locally; not pushed)
- Base: `3da2389`

## Implemented functionality

- **SSH trust**: unknown vs. changed host keys, append-only explicit trust,
  bounded trust-file reads, pins, bastion trust, Network Diagnostics review.
- **MobaXterm migration**: user-selected SSH text bookmarks with no credentials,
  network access, startup commands, or secrets; folders/bastions preserved;
  idempotent re-import; aliases reported for review.
- **Terminal**: local PTY, tabs/splits, search, scrollback, copy/paste, 256-color
  rendering, bounded backpressure, exact PTY cleanup.
- **Per-session terminal preferences**: font size 8–32, scrollback 100–100000,
  cursor blink; validated, persisted, exported/imported, legacy-compatible.
- **SSH/SFTP/SCP**: password, private key (incl. encrypted), agent and
  keyboard-interactive auth; SFTP browser and recursive transfers;
  **hash-verified resumable SFTP downloads**; SCP/uploads restart.
- **Tunnels**: local, remote, SOCKS5; jump hosts.
- **Sessions/settings**: folders, favorites, recents, search, JSON export/import,
  OpenSSH import, snippets, macros, hotkeys.
- **Diagnostics**: resolve/TCP/ping/traceroute/bounded scan with cancellation.
- **Vault**: OS keyring or Argon2/AES-GCM portable vault; secrets never returned
  to the renderer.
- **Accessibility**: axe-core 0 violations across 7 views and 9 dialogs; dialog
  focus/trap; high-DPI (DPR 1/1.5/2) no horizontal overflow; live regions.

## Verified results

| Check | Result |
|---|---|
| `cargo fmt --all -- --check` | pass |
| `cargo clippy --locked --workspace --all-targets -- -D warnings` | pass |
| `cargo test --locked --workspace` (umask 022) | pass (31 suites) |
| `cargo build --locked --workspace --release` | pass |
| Frontend install/test/check/lint/build | pass |
| `cargo audit` | 0 vulnerabilities, 5 warnings |
| License check / release-asset tests | pass / 11 of 11 |
| Quality CI `42909861636` (all 6 platforms) | success |
| Release CI `42912570453` (all 6 builds) | success; publish skipped |

Quality jobs: ubuntu-22.04, ubuntu-24.04-arm, windows-latest, windows-11-arm,
macos-15-intel and macos-15 all pass; only the intentional `dependency-audit`
job fails. Release jobs all six succeed; `publish` is skipped by design.

## Verified installers (unsigned, unpublished)

All files were downloaded from the Release run, and every per-platform
`SHA256SUMS-*.txt` was verified with `sha256sum -c`.

| Platform | File | Bytes | SHA-256 |
|---|---|---|---|
| Windows x64 | `MobaRust-0.1.32-windows-x64.exe` | 6,195,472 | `071ed6562d024d24193389a0fe45528477ea980e1aa9feb6ae9c06d4cadd6446` |
| Windows ARM64 | `MobaRust-0.1.32-windows-arm64.exe` | 5,471,607 | `659090a01002717f760f6861437cdb0b719a04c134e85aae3fd6bbb9b45318e8` |
| Linux x64 | `MobaRust-0.1.32-linux-x64.deb` | 11,011,662 | `b76a2bd4bb1f67f2ecf6e1c42212bdf4e919275153ca7a90d7baeb8874fbd184` |
| Linux x64 | `MobaRust-0.1.32-linux-x64.rpm` | 11,017,353 | `f71e929cc16078c48c124e9e522c47f82c352f07d61d0b4f5c03fddcfde83b2d` |
| Linux x64 | `MobaRust-0.1.32-linux-x64.AppImage` | 88,402,424 | `b89c5a4337a2390539339f379aef5115027991803470a5d58378fecccca33a51` |
| Linux ARM64 | `MobaRust-0.1.32-linux-arm64.deb` | 11,194,334 | `d43a7d3a50773664b8516ecc331b233dade3964cef6ad170ca14759b66b3c7bc` |
| Linux ARM64 | `MobaRust-0.1.32-linux-arm64.rpm` | 11,199,454 | `148a9440d1d798838664907d3e405b8c9221c485899a073833a18b7f3f3803df` |
| Linux ARM64 | `MobaRust-0.1.32-linux-arm64.AppImage` | 86,731,272 | `961e4bc01e9f169ca3bd54b1f54e96b280aaf4dc4996fe7f866c9070d23b0c52` |
| macOS Intel | `MobaRust-0.1.32-macos-x64.dmg` | 10,151,084 | `7c73bd62127cae576741a3c19bbe2e2d395fc8ded524353dd3b7d15f615a495b` |
| macOS ARM64 | `MobaRust-0.1.32-macos-arm64.dmg` | 9,499,615 | `f06a96ed18aa4ef8d493873ec6c504a8e150400e4e0bbf9603f57bd1e71ae2d1` |

Preserved at `/home/shood/MobaRust-review/artifacts/release-0.1.32-rc.1/`
(with per-platform manifests and `SHA256SUMS-all.txt`). The Linux x64 DEB was
extracted (not installed) and reports `MobaRust 0.1.32`. Install steps:
[INSTALL.md](INSTALL.md).

## Outstanding dependency warnings

0 vulnerabilities; 5 warnings (`glib`, `proc-macro-error`, `zbus_names`,
`zvariant`, `zvariant_derive`). Full paths and dispositions are in
[DEPENDENCY_EXCEPTIONS.md](DEPENDENCY_EXCEPTIONS.md). No warnings were
suppressed and no exception is granted by the agent. The strict audit gate
remains red by design.

## Security

- No credentials/private keys committed; PEM matches are parser literals.
- Host trust fails closed; credentials use the OS keyring or encrypted vault;
  logs/exports are secret-free.
- Pre-push audit passed (license, branch payload, private-key markers).
- Builds are **unsigned** (no Authenticode / Developer ID / notarization).

## Known limitations

- RDP/VNC experimental; RDP excluded from normal packages.
- Telnet and serial are unencrypted by design.
- Resumable transfers are download-only (SFTP).
- SSH-only dialogs need a live session; screen-reader acceptance is manual.
- Synthetic X11 fixture is skipped on macOS arm64 (early EOF); Intel macOS,
  Linux and the DMG build pass.
- Five dependency warnings above; stable release not approved.

## Required owner actions

1. Decide `DEPENDENCY_EXCEPTIONS.md` (upgrade project vs. accepted exception).
2. Approve publishing and push the RC tag:
   `git push origin v0.1.32-rc.1`
   then (after approval) create a draft release via the gated workflow:
   `gh workflow run "Release installers" -R kuc6708/MobaRust --ref v0.1.32-rc.1 -f publish=true`
   or create/publish a release from the verified local artifacts.
3. Provide signing/notarization credentials if signed builds are required.
4. Upstream publishing additionally needs write access to the owner repository
   (still read-only here).
