# MobaRust 0.1.31 — Development Release Notes

**This is a development snapshot (branch `rea/production-readiness-2026-11-09`),
not a stable release.** It is unsigned, no tag or release has been published,
and nothing has been installed over an existing application.

## Implemented functionality

- **SSH trust**: unknown vs. changed host-key errors, append-only explicit trust,
  bounded trust-file reads, pins, bastion trust, and a Network Diagnostics review
  flow. Changed keys are never replaced silently.
- **MobaXterm migration**: user-selected SSH text bookmarks are imported from
  MobaXterm INI/mxtsessions without credentials, network access, startup
  commands, or secrets; folders and bastion fields are preserved; re-import is
  idempotent; aliases are reported for review.
- **Terminal**: local PTY, tabs, splits, search, scrollback, copy/paste, 256-color
  xterm rendering, bounded backpressure, and exact PTY cleanup on quit.
- **Per-session terminal preferences**: font size (8–32), scrollback
  (100–100000) and cursor blink, validated, persisted, exported/imported, and
  compatible with older session files.
- **SSH/SFTP/SCP**: password, private key (including encrypted), agent and
  keyboard-interactive authentication; SFTP browser, recursive transfers,
  progress/cancel; **safe resumable SFTP downloads** (hidden 0600 part, SHA-256
  prefix verification against the remote, discard on cancel/mismatch); SCP and
  uploads restart.
- **Tunnels**: local, remote and dynamic (SOCKS5) forwarding with explicit bind
  addresses and connection ownership/cleanup; jump hosts.
- **Sessions/settings**: folders, favorites, recents, search, JSON export/import,
  OpenSSH config import, snippets, macros, hotkeys.
- **Diagnostics**: resolve/TCP/ping/traceroute/bounded scan with cancellation.
- **Credential vault**: OS keyring or an explicit Argon2/AES-GCM portable vault;
  secrets are never listed or returned to the renderer.
- **Accessibility (scoped)**: axe-core 0 violations across 7 views and 9 dialogs;
  dialog focus/trap; high-DPI (DPR 1/1.5/2) no horizontal overflow; live regions
  on connection/transfer/scan state.

## Verified results (this checkout)

| Check | Result |
|---|---|
| `cargo fmt --all -- --check` | pass |
| `cargo clippy --locked --workspace --all-targets -- -D warnings` | pass |
| `cargo test --locked --workspace` (umask 022) | pass (31 suites) |
| `cargo build --locked --workspace --release` | pass |
| Frontend install/test/check/lint/build | pass |
| `cargo audit` | 0 vulnerabilities, 5 unsuppressed warnings |
| `cargo xtask license-check` | pass (canonical Apache-2.0) |
| `tools/release-assets.test.mjs` | 9/9 pass |
| Linux x64 DEB/RPM/AppImage build + checksums | pass |

Notable suite counts: desktop 117, core 30+4, store 46+4, SSH library 48,
authentication 16 (4 manual ignored), forwarding 4, local-sshd 26 (1 ignored;
IPv6/routed stress skipped on hosts without IPv6 or on macOS), xtask 21.

## Outstanding dependency warnings

0 vulnerabilities; 5 warnings remain (`glib`, `proc-macro-error`,
`zbus_names`, `zvariant`, `zvariant_derive`). They are documented with paths and
dispositions in [DEPENDENCY_EXCEPTIONS.md](DEPENDENCY_EXCEPTIONS.md). The strict
`cargo audit --deny warnings` gate remains **red by design**.

## Security audit results

- `cargo audit`: 0 vulnerabilities; 5 warnings (above). No ignore rules added.
- Pre-push audit: canonical Apache-2.0 license, branch payload and private-key
  markers reviewed.
- No credentials/private keys are committed. The only "PRIVATE KEY" matches are
  PEM delimiter literals in the vendored key parser.
- SSH host trust fails closed; credentials use the OS keyring or the encrypted
  portable vault; logs/exports are secret-free.

## Platform build status

| Platform | Quality checks | Distributable package |
|---|---|---|
| Linux x64 | pass (CI) | **built locally** (DEB/RPM/AppImage, SHA-256 below) |
| Linux ARM64 | pass (CI) | not built (needs CI Release/native runner) |
| Windows x64 | pass (CI) | not built (needs CI Release/native runner) |
| Windows ARM64 | pass (CI) | not built (not in the release matrix) |
| macOS Intel | pass (CI) | not built (needs CI Release/native runner) |
| macOS ARM64 | runner cancelled | not built |

Hosted Quality run `42854226245` (commit `32295e8`): ubuntu-22.04,
ubuntu-24.04-arm, windows-latest, windows-11-arm and macos-15-intel pass;
macos-15 (arm64) was cancelled while queued; dependency-audit fails by design.

## Linux x64 artifacts and SHA-256

```
59c01c09194b167df067e06f0625951e2a6f13a80653560a3ac21c68055423db  MobaRust-0.1.31-linux-x64.AppImage
a214f39399d8d8d1a70ac5e90ea0442e7a7881734671347115ae0774a4260bea  MobaRust-0.1.31-linux-x64.deb
b1af997872709dd2ecb49436e6496793941f7d388b58a8df67de75250dc8405b  MobaRust-0.1.31-linux-x64.rpm
```

They are preserved in the review package under `artifacts/linux-x64/` with
`SHA256SUMS-linux-x64.txt`. They are **unsigned** and not published. Installation
instructions are in [INSTALL.md](INSTALL.md).

## Known limitations

- Unsigned builds (no Authenticode, Apple Developer ID, or notarization).
- RDP/VNC are experimental; RDP is excluded from normal packages.
- X11: synthetic fixture passes; no embedded X server.
- Telnet and serial traffic are unencrypted by design (explicit warnings).
- Resumable transfers are download-only (SFTP); SCP/uploads restart.
- SSH-only dialogs (session editor, tunnel, remote editor) need a live session;
  screen-reader acceptance is still manual.
- macos-15 arm64 hosted runner cancelled; no macOS packages were produced.
- Dependency warnings above; strict audit gate intentionally red.

## Required owner actions

See [RELEASE_READINESS.md](RELEASE_READINESS.md) and
[DEPENDENCY_EXCEPTIONS.md](DEPENDENCY_EXCEPTIONS.md). In short: decide the
dependency exception/upgrade track, grant the `workflow` scope (and upstream
write if publishing from the owner repo), provide signing/notarization
credentials, and run the release workflow on native runners.
