# MobaRust 0.1.34-rc.1 — SSH authentication diagnostics test build

**Verified, unpublished test build.** Commit `e27a282`; local tag
`v0.1.34-rc.1` (not pushed); no GitHub release.

## Root cause of the 0.1.33 Windows authentication failure

MobaXterm import preserves the MobaXterm **username** and key path, but it does
not copy MobaXterm authentication preferences, passwords, or agent settings. The
imported `cc00sw03` session therefore defaulted to interactive
keyboard-interactive prompts and the MobaXterm username. The Windows OpenSSH
profile that works uses a different identity (`shood-admin`) and the Windows
OpenSSH agent. MobaRust's Windows agent path previously tried **Pageant only**,
so the Windows OpenSSH Authentication Agent's named pipe was never consulted.

## Fixes

- Windows SSH-agent authentication now tries Pageant and then the Windows
  OpenSSH Authentication Agent named pipe
  (`\\.\pipe\openssh-ssh-agent`).
- Missing, unreadable, and PuTTY `.ppk` keys, an unavailable agent, an agent
  with no identities, and a missing saved credential now produce distinct,
  actionable errors. No key bytes, passwords, passphrases, or agent material is
  logged or displayed.
- Private-key paths expand `%VARS%` such as `%USERPROFILE%` in addition to `~`.
- Auth failures show the attempted method, guidance to verify the username and
  credentials, and an **Edit session…** action for saved sessions.
- Session editor and Quick Connect label the Windows OpenSSH agent and document
  key-path expansion and `.ppk` conversion.
- MobaXterm import states clearly that authentication preferences are not
  imported and that sessions default to interactive prompts. Usernames and key
  paths remain preserved.
- Strict host-key verification is unchanged.

## Verified Windows x64 test installer

| File | Bytes | SHA-256 |
|---|---|---|
| `MobaRust-0.1.34-windows-x64.exe` | 6,202,828 | `e246e5f264cf2a195288b8dfad97e38c5b47005c5eab4b0cc86c368844bbed91` |

Preserved at `/home/shood/MobaRust-review/artifacts/release-0.1.34-rc.1/`.
Unsigned; do not overwrite an existing installation without authorization.

## Verification

- Local: SSH library 51, store 47, desktop 119, authentication 16, local-sshd
  26; fmt/clippy clean; frontend check/lint/unit/build pass.
- Quality CI `43039246358`: Windows x64 and Windows ARM64 compile checks pass;
  the Linux jobs were superseded by a newer docs run.
- Release CI `43039266221`: Windows x64 and Windows ARM64 builds pass.

## Fixing the saved session

Either:

1. Edit `cc00sw03 (Prod)` and use the same identity as OpenSSH: username
   `shood-admin`, method **SSH agent (Pageant or Windows OpenSSH)**; or select
   the private-key path (for example `%USERPROFILE%\.ssh\id_ed25519`), converting
   `.ppk` first; **or**
2. Import `%USERPROFILE%\.ssh\config` (the OpenSSH upload action) and use the
   `shood-admin` profile it creates.

The new error banner identifies the attempted method and offers **Edit session…**.

---

# MobaRust 0.1.33-rc.1 — SSH trust-fix test build

**Verified, unpublished test build.** Commit `4a0b2b0`; local tag
`v0.1.33-rc.1` (not pushed); no GitHub release.

## What changed

- Sessions without an explicit trust file or pin now use the user's **OpenSSH
  known_hosts** (`%USERPROFILE%\.ssh\known_hosts` on Windows) instead of
  `RejectUnknown`. Unknown keys are still rejected; changed keys still fail
  closed.
- The connection warning now offers **Review & trust host key…**: it inspects
  the key, shows host/port/algorithm/SHA-256 fingerprint, requires confirmation,
  persists to the default/overridden known_hosts, and retries. Changed keys get
  no trust action.
- Trust creation now creates the missing `.ssh` directory (0700 on Unix);
  CRLF and missing-file known_hosts behavior is covered by regression tests.
- Diagnostics distinguish handshake closures from network failures.
- Local shell labels are correct on Windows: the default/cmd surface shows
  `cmd.exe` (tabs and the runtime Surface), explicit shells and WSL are labeled
  by their actual target.

## Verified Windows x64 test installer

| File | Bytes | SHA-256 |
|---|---|---|
| `MobaRust-0.1.33-windows-x64.exe` | 6,209,025 | `f507e25aa6a2131a0dfc8daea478e5d182127f0400278c0f2e86eb58b701e5ba` |

Preserved at `/home/shood/MobaRust-review/artifacts/release-0.1.33-rc.1/`.
The installer is **unsigned** and may upgrade an installed 0.1.32 build; back up
first and prefer a disposable VM or separate user account. Do not overwrite an
existing installation without authorization.

## Verification

- Local: SSH library 50, desktop 118, authentication 16, local-sshd 26;
  fmt/clippy clean; frontend check/lint/unit/build pass.
- Quality CI `42920573667`: all six platforms success; only the intentional
  `dependency-audit` gate fails.
- Release CI `42920592534`: all six builds success; publish skipped.

## Testing the fix

1. Install/run this build (VM recommended).
2. Connect `cc00sw03.ifaw.net`: Windows OpenSSH already saved its ED25519 key in
   your user known_hosts, which MobaRust now uses by default.
3. If it still reports an unknown key, click **Review & trust host key…**,
   compare `SHA256:GPLF6NxXJhRiwiNiyGRihC36la4aIw1KdYknZwVrHZE` independently,
   keep the default trust path, and confirm. Changed keys remain refused.

---

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
